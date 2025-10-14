/**
 * @fileoverview A runtime-based preloader that continuously prefetches internal links
 * as they become visible, improving perceived navigation speed.
 *
 * It is self-contained, has no dependencies, and is framework-agnostic.
 * It is activated by simply importing it into the main application bundle.
 *
 * Features:
 * - Auto-detects all internal, routable links.
 * - Uses IntersectionObserver to prefetch links just before they enter the viewport.
 * - Uses requestIdleCallback to avoid blocking the main thread.
 * - Respects user's data-saving preferences.
 * - Limits concurrent prefetches to avoid network congestion.
 * - Prevents duplicate prefetches.
 * - Exposes a global `window.__prefetchStats` object for debugging.
 */

if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
  // --- Configuration ---
  const MAX_CONCURRENT_PREFETCHES = 6;
  const INTERSECTION_ROOT_MARGIN = '50%'; // Prefetch when a link is 50% of the viewport height away.
  const MUTATION_OBSERVER_DEBOUNCE = 500; // ms to wait after DOM changes before re-scanning.

  // --- State ---
  const prefetchedUrls = new Set();
  let prefetchQueue = [];
  let activePrefetches = 0;
  let mutationTimeout;

  // Expose stats for debugging
  window.__prefetchStats = {
    total: 0,
    queued: 0,
    saved: 0,
  };

  // --- Core Functions ---

  /**
   * Creates and appends a <link rel="prefetch"> hint to the <head>.
   * @param {string} url The URL to prefetch.
   */
  function addPrefetchHint(url) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document'; // Explicitly prefetching a document

    // Remove the hint after it has been processed to keep the <head> clean.
    link.onload = () => link.remove();
    link.onerror = () => link.remove(); // Also remove on error

    document.head.appendChild(link);
  }

  /**
   * Processes the prefetch queue, respecting concurrency limits.
   */
  function processQueue() {
    while (activePrefetches < getConcurrencyLimit() && prefetchQueue.length > 0) {
      const urlToPrefetch = prefetchQueue.shift();
      if (urlToPrefetch && !prefetchedUrls.has(urlToPrefetch)) {
        activePrefetches++;
        prefetchedUrls.add(urlToPrefetch);
        
        window.__prefetchStats.total++;
        window.__prefetchStats.queued = prefetchQueue.length;

        addPrefetchHint(urlToPrefetch);

        // Since 'onload' fires quickly for prefetches, we use a timeout to decrement
        // the active count, simulating the release of a network slot.
        setTimeout(() => {
          activePrefetches--;
          processQueue(); // Check if more items can be processed
        }, 500); // A reasonable delay to prevent bursting
      }
    }
  }

  /**
   * Adds a URL to the prefetch queue if it's eligible.
   * @param {string} url The URL to potentially queue.
   */
  function queuePrefetch(url) {
    if (shouldPrefetch() && !prefetchedUrls.has(url) && !prefetchQueue.includes(url)) {
      prefetchQueue.push(url);
      window.requestIdleCallback(processQueue);
    }
  }

  /**
   * Scans the document for all eligible <a> tags and adds them to the IntersectionObserver.
   */
  function scanAndObserveLinks() {
    document.querySelectorAll('a[href]').forEach((link) => {
      const url = new URL(link.href, window.location.origin);

      // Only prefetch internal, non-hash, non-mailto links
      if (window.location.origin === url.origin && url.pathname !== window.location.pathname && !url.hash && !link.href.startsWith('mailto:')) {
        intersectionObserver.observe(link);
      }
    });
  }

  // --- Observers and Event Listeners ---

  /**
   * The IntersectionObserver callback. Queues a link for prefetching when it becomes visible.
   * @param {IntersectionObserverEntry[]} entries
   */
  const intersectionObserverCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const link = entry.target;
        queuePrefetch(link.href);
        // Stop observing the link once it has been queued to prevent re-triggering.
        intersectionObserver.unobserve(link);
      }
    });
  };

  const intersectionObserver = new IntersectionObserver(intersectionObserverCallback, {
    rootMargin: INTERSECTION_ROOT_MARGIN,
  });

  /**
   * The MutationObserver callback. Triggers a debounced re-scan when the DOM changes.
   */
  const mutationObserverCallback = () => {
    clearTimeout(mutationTimeout);
    mutationTimeout = setTimeout(scanAndObserveLinks, MUTATION_OBSERVER_DEBOUNCE);
  };

  const mutationObserver = new MutationObserver(mutationObserverCallback);

  /**
   * Wraps history methods to re-scan links after SPA navigations.
   * @param {('pushState' | 'replaceState')} method
   */
  function wrapHistoryMethod(method) {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args);
      // Re-scan after the state has been pushed/replaced.
      requestAnimationFrame(scanAndObserveLinks);
      return result;
    };
  }

  // --- Helpers ---

  /**
   * Checks if the browser and user settings allow prefetching.
   * @returns {boolean}
   */
  function shouldPrefetch() {
    const connection = navigator.connection;
    if (connection?.saveData) {
      window.__prefetchStats.saved++;
      return false;
    }
    return true;
  }

  /**
   * Determines the number of parallel prefetches based on connection speed.
   * @returns {number}
   */
  function getConcurrencyLimit() {
    const connection = navigator.connection;
    switch (connection?.effectiveType) {
      case '2g':
        return 2;
      case '3g':
        return 4;
      default:
        return MAX_CONCURRENT_PREFETCHES;
    }
  }

  // --- Initialization ---

  /**
   * Sets up all observers and initial scans.
   */
  function initialize() {
    // Start by observing the initial set of links
    scanAndObserveLinks();

    // Watch for DOM changes (lazy-loaded content, etc.)
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Re-scan on SPA route changes
    wrapHistoryMethod('pushState');
    wrapHistoryMethod('replaceState');
  }

  // Start the whole process once the document is ready.
  if (document.readyState === 'complete') {
    initialize();
  } else {
    window.addEventListener('DOMContentLoaded', initialize, { once: true });
  }
}
