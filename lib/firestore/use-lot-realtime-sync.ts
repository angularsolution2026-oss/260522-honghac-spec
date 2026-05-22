'use client';

import { useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, where, type QuerySnapshot, type DocumentChangeType } from 'firebase/firestore';
import { firestoreDb } from './client';
import type { LotStatus } from '@/data/types/honghac';

/**
 * Real-time sync hook for lot status updates from Firestore.
 *
 * Listens to `lots_realtime` collection and calls onLotStatusChange callback
 * whenever a lot's status changes (available → reserved → sold).
 *
 * Usage:
 *   useLotRealtimeSync(activeSubdivision, (internalId, newStatus) => {
 *     // Update map layer filter, lot popover state, etc.
 *   });
 */

export function useLotRealtimeSync(
  activeSubdivision: string,
  onLotStatusChange: (internalId: string, newStatus: LotStatus) => void,
) {
  useEffect(() => {
    if (!activeSubdivision) {
      console.log('[v0] useLotRealtimeSync: no active subdivision, skipping listener');
      return;
    }

    console.log('[v0] useLotRealtimeSync: setting up listener for subdivision:', activeSubdivision);

    // Query lots_realtime collection where subdivision matches
    const q = query(
      collection(firestoreDb, 'lots_realtime'),
      where('subdivision', '==', activeSubdivision),
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        console.log('[v0] useLotRealtimeSync: snapshot received, docs:', snapshot.docs.length);
        
        snapshot.docChanges().forEach((change: { type: DocumentChangeType; doc: any }) => {
          if (change.type === 'modified' || change.type === 'added') {
            const data = change.doc.data();
            const internalId = data.internal_id as string;
            const status = data.status as LotStatus;
            
            console.log(`[v0] useLotRealtimeSync: lot ${internalId} status → ${status}`);
            onLotStatusChange(internalId, status);
          }
        });
      },
      (error: Error) => {
        console.warn('[v0] useLotRealtimeSync: snapshot error:', error);
      },
    );

    return () => {
      console.log('[v0] useLotRealtimeSync: cleaning up listener');
      unsubscribe();
    };
  }, [activeSubdivision, onLotStatusChange]);
}

/**
 * Mock function to simulate real-time lot status updates (for demo without real Firebase).
 * Selects 3-5 random lots and simulates status change to "sold".
 */
export function createMockLotStatusUpdate(
  allInternalIds: string[],
  onUpdate: (internalId: string, status: LotStatus) => void,
): void {
  if (allInternalIds.length === 0) {
    console.warn('[v0] createMockLotStatusUpdate: no internal IDs provided');
    return;
  }

  const numToUpdate = Math.min(3 + Math.floor(Math.random() * 3), allInternalIds.length);
  const shuffled = [...allInternalIds].sort(() => Math.random() - 0.5);
  const selectedIds = shuffled.slice(0, numToUpdate);

  console.log(`[v0] createMockLotStatusUpdate: simulating status change for ${selectedIds.length} lots`);

  selectedIds.forEach((id, index) => {
    setTimeout(() => {
      onUpdate(id, 'sold');
      console.log(`[v0] Mock: lot ${id} → sold`);
    }, index * 200); // Stagger updates by 200ms for visibility
  });
}
