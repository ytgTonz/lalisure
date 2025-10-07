/**
 * Dynamic Import Utilities
 *
 * Provides optimized dynamic imports for code splitting and bundle size optimization.
 * Use these utilities to lazy-load heavy components and reduce initial bundle size.
 */

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Loading component shown during dynamic import
 */
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

/**
 * Error component shown when dynamic import fails
 */
const ErrorFallback = ({ error }: { error?: Error }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <p className="text-sm text-destructive">Failed to load component</p>
    {error && <p className="mt-2 text-xs text-muted-foreground">{error.message}</p>}
  </div>
);

/**
 * Creates a dynamically imported component with loading and error states
 *
 * @param importFn - Function that returns the dynamic import
 * @param options - Dynamic import options
 *
 * @example
 * ```typescript
 * export const HeavyChart = createDynamicComponent(
 *   () => import('@/components/charts/HeavyChart'),
 *   { ssr: false }
 * );
 * ```
 */
export function createDynamicComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: {
    ssr?: boolean;
    loading?: ComponentType;
  } = {}
) {
  return dynamic(importFn, {
    loading: options.loading || LoadingSpinner,
    ssr: options.ssr ?? true,
  });
}

/**
 * Pre-configured dynamic imports for heavy dependencies
 */
export const DynamicComponents = {
  /**
   * Email editor - Heavy dependency (~200KB)
   * Only load when user opens email template editor
   */
  EmailEditor: createDynamicComponent(
    () => import('react-email-editor').then(mod => ({ default: mod.default })),
    { ssr: false }
  ),

  /**
   * Charts - Heavy if using chart libraries
   * Load only on dashboard/analytics pages
   */
  // Example: Uncomment when adding chart library
  // BarChart: createDynamicComponent(
  //   () => import('@/components/charts/BarChart'),
  //   { ssr: false }
  // ),

  /**
   * PDF Viewer - Heavy dependency
   * Load only when user views documents
   */
  // PDFViewer: createDynamicComponent(
  //   () => import('@/components/documents/PDFViewer'),
  //   { ssr: false }
  // ),

  /**
   * Map components - Heavy with mapping libraries
   * Load only on claim submission with location
   */
  // MapPicker: createDynamicComponent(
  //   () => import('@/components/maps/MapPicker'),
  //   { ssr: false }
  // ),
} as const;

/**
 * Preload a dynamic component
 * Useful for prefetching on hover or route change prediction
 *
 * @example
 * ```typescript
 * <button
 *   onMouseEnter={() => preloadComponent(DynamicComponents.EmailEditor)}
 *   onClick={() => setShowEditor(true)}
 * >
 *   Open Editor
 * </button>
 * ```
 */
export function preloadComponent<P>(
  Component: ReturnType<typeof createDynamicComponent<P>>
) {
  // Next.js dynamic components have a preload method
  if (typeof (Component as any).preload === 'function') {
    (Component as any).preload();
  }
}
