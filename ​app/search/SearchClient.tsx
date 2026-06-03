'use client';

/**
 * SearchClient — the entire interactive experience.
 *
 *  - Owns the search query, location, and proximity filter via
 *    `useMedicineSearch`.
 *  - Renders the search bar, proximity chips, and the live results
 *    feed.
 *  - Handles the three empty states: initial / no-results / error.
 *
 * The component is intentionally small. All the heavy lifting is in
 * the hook + ResultCard.
 */

import { useMemo, useState } from 'react';
import { HeroHeader } from '@/components/consumer/HeroHeader';
import { SearchBar } from '@/components/consumer/SearchBar';
import {
    ProximityFilter,
    PROXIMITY_OPTIONS,
    type ProximityOption,
} from '@/components/consumer/ProximityFilter';
import { ResultCard } from '@/components/consumer/ResultCard';
import { EmptyState } from '@/components/consumer/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useMedicineSearch } from '@/hooks/useMedicineSearch';
import { cn } from '@/lib/utils/format';

export function SearchClient() {
    const {
        query,
        setQuery,
        userLocation,
        geoStatus,
        geoError,
        requestLocation,
        maxDistanceKm,
        setMaxDistanceKm,
        results,
        isLoading,
        error,
        hasSearched,
    } = useMedicineSearch();

    // Track the *selected* proximity chip separately from the actual
    // maxDistanceKm value so the UI doesn't visually flicker when
    // results return zero. The chip is the user's intent; the
    // value drives the request.
    const [activeProximity, setActiveProximity] = useState<ProximityOption['id']>('anywhere');

    function handleProximityChange(id: ProximityOption['id']) {
        setActiveProximity(id);
        const opt = PROXIMITY_OPTIONS.find((o) => o.id === id);
        setMaxDistanceKm(opt?.maxKm ?? null);
    }

    // Pre-compute the result variant. Memoized so the empty-state
    // component doesn't re-render on every keystroke.
    const state = useMemo<'initial' | 'no-results' | 'error' | 'results'>(() => {
        if (error) return 'error';
        if (!hasSearched) return 'initial';
        if (results.length === 0) return 'no-results';
        return 'results';
    }, [error, hasSearched, results.length]);

    const trimmedQuery = query.trim();

    return (
        <div className="min-h-screen bg-slate-50">
            <HeroHeader />

            <main className="mx-auto -mt-6 max-w-3xl px-4 pb-16 sm:px-6">
                {/* ---- Search bar (sits over the hero) -------------- */}
                <section
                    aria-label="Search medicine"
                    className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-200 sm:p-6"
                >
                    <SearchBar
                        value={query}
                        onChange={setQuery}
                        geoStatus={geoStatus}
                        geoError={geoError}
                        onUseCurrentLocation={() => void requestLocation()}
                        hasUserLocation={geoStatus === 'granted'}
                    />
                </section>

                {/* ---- Proximity filter (only after first search) --- */}
                {trimmedQuery.length >= 2 && (
                    <section className="mt-6" aria-label="Filter results by distance">
                        <ProximityFilter
                            value={activeProximity}
                            onChange={handleProximityChange}
                            resultCount={results.length}
                        />
                    </section>
                )}

                {/* ---- Results feed --------------------------------- */}
                <section className="mt-6" aria-label="Search results">
                    {state === 'initial' && <EmptyState variant="initial" />}

                    {state === 'error' && (
                        <EmptyState
                            variant="error"
                            title="We hit a snag"
                            description={error ?? 'Please try again in a moment.'}
                        />
                    )}

                    {state === 'no-results' && (
                        <EmptyState
                            variant="no-results"
                            title={
                                activeProximity === 'anywhere'
                                    ? 'No pharmacy has it in stock'
                                    : `No pharmacy within ${
                                          PROXIMITY_OPTIONS.find((o) => o.id === activeProximity)
                                              ?.label ?? 'this distance'
                                      }`
                            }
                        />
                    )}

                    {state === 'results' && (
                        <ResultsList results={results} isLoading={isLoading} />
                    )}

                    {/* Loading overlay during typing (results still
                        visible underneath, just dimmed) */}
                    {isLoading && state === 'results' && (
                        <div
                            role="status"
                            aria-label="Refreshing results"
                            className="pointer-events-none fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur"
                        >
                            <Spinner className="h-3.5 w-3.5 text-white" />
                            Searching…
                        </div>
                    )}
                </section>

                {/* ---- Footer / brand strip ---------------------- */}
                <footer className="mt-12 text-center text-xs text-slate-400">
                    <p>
                        MedFinder · helping Addis Ababa find medicine faster.
                    </p>
                    <p className="mt-1">
                        User location: {userLocation.latitude.toFixed(4)}°N,{' '}
                        {userLocation.longitude.toFixed(4)}°E
                    </p>
                </footer>
            </main>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Inline results list — kept in this file to avoid prop drilling            */
/* -------------------------------------------------------------------------- */

interface ResultsListProps {
    results: ReturnType<typeof useMedicineSearch>['results'];
    isLoading: boolean;
}

function ResultsList({ results, isLoading }: ResultsListProps) {
    return (
        <ul
            className={cn(
                'grid grid-cols-1 gap-3 transition sm:gap-4',
                isLoading && 'opacity-70'
            )}
        >
            {results.map((r) => (
                <li key={r.inventoryId}>
                    <ResultCard result={r} />
                </li>
            ))}
        </ul>
    );
}
