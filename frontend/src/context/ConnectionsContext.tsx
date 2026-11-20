/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

export interface ConnectionMetadata {
  connectionId: number;
  label: string;
  accountId: string;
  roleArn: string;
  status: string;
  createdAt: string;
  externalId?: string | null;
  savedLocally: boolean;
}

export interface ConnectionsContextType {
  connections: ConnectionMetadata[];
  activeConnection: ConnectionMetadata | null;
  add: (conn: Omit<ConnectionMetadata, 'savedLocally'>) => void;
  update: (connectionId: number, updates: Partial<ConnectionMetadata>) => void;
  remove: (connectionId: number) => void;
  setActive: (connectionId: number | null) => void;
}

const ConnectionsContext = createContext<ConnectionsContextType | undefined>(
  undefined,
);

function getSavedConnectionsForUser(userEmail: string): {
  connections: ConnectionMetadata[];
  active: ConnectionMetadata | null;
} {
  if (!userEmail) {
    return { connections: [], active: null };
  }
  try {
    const storageKey = `cloudwise.connections.${userEmail}`;
    const activeKey = `cloudwise.activeConnection.${userEmail}`;

    const raw = localStorage.getItem(storageKey);
    let parsed: ConnectionMetadata[] = [];

    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        parsed = data.map((item) => ({
          ...item,
          savedLocally: true,
        }));
      }
    }

    const activeIdRaw = localStorage.getItem(activeKey);
    let active: ConnectionMetadata | null = null;
    if (activeIdRaw) {
      const activeId = Number(activeIdRaw);
      active = parsed.find((c) => c.connectionId === activeId) || (parsed[0] ?? null);
    } else if (parsed.length > 0) {
      active = parsed[0];
    }

    return { connections: parsed, active };
  } catch {
    return { connections: [], active: null };
  }
}

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userEmail = user?.email?.toLowerCase() || '';

  const [connections, setConnections] = useState<ConnectionMetadata[]>(() =>
    getSavedConnectionsForUser(userEmail).connections,
  );
  const [activeConnection, setActiveConnection] =
    useState<ConnectionMetadata | null>(() =>
      getSavedConnectionsForUser(userEmail).active,
    );

  // Sync state whenever the authenticated user changes
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const initial = getSavedConnectionsForUser(userEmail);
      setConnections(initial.connections);
      setActiveConnection(initial.active);
    });

    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  // Persist connections to localStorage when modified
  const persistConnections = useCallback(
    (newConnections: ConnectionMetadata[], activeId: number | null) => {
      if (!userEmail) return;
      try {
        const storageKey = `cloudwise.connections.${userEmail}`;
        const activeKey = `cloudwise.activeConnection.${userEmail}`;

        localStorage.setItem(storageKey, JSON.stringify(newConnections));
        if (activeId !== null) {
          localStorage.setItem(activeKey, String(activeId));
        } else {
          localStorage.removeItem(activeKey);
        }
      } catch {
        // Ignore storage quotas or restrictions
      }
    },
    [userEmail],
  );

  const add = useCallback(
    (conn: Omit<ConnectionMetadata, 'savedLocally'>) => {
      const newEntry: ConnectionMetadata = {
        ...conn,
        savedLocally: true,
      };

      setConnections((prev) => {
        const filtered = prev.filter(
          (c) => c.connectionId !== conn.connectionId,
        );
        const updated = [...filtered, newEntry];
        persistConnections(updated, newEntry.connectionId);
        return updated;
      });

      setActiveConnection(newEntry);
    },
    [persistConnections],
  );

  const update = useCallback(
    (connectionId: number, updates: Partial<ConnectionMetadata>) => {
      setConnections((prev) => {
        const updated = prev.map((item) => {
          if (item.connectionId === connectionId) {
            return { ...item, ...updates, savedLocally: true };
          }
          return item;
        });

        persistConnections(
          updated,
          activeConnection?.connectionId ?? connectionId,
        );
        return updated;
      });

      setActiveConnection((prev) => {
        if (prev?.connectionId === connectionId) {
          return { ...prev, ...updates, savedLocally: true };
        }
        return prev;
      });
    },
    [activeConnection, persistConnections],
  );

  const remove = useCallback(
    (connectionId: number) => {
      setConnections((prev) => {
        const updated = prev.filter((c) => c.connectionId !== connectionId);
        const nextActiveId =
          activeConnection?.connectionId === connectionId
            ? (updated[0]?.connectionId ?? null)
            : (activeConnection?.connectionId ?? null);

        persistConnections(updated, nextActiveId);
        return updated;
      });

      setActiveConnection((prev) => {
        if (prev?.connectionId === connectionId) {
          const remaining = connections.filter(
            (c) => c.connectionId !== connectionId,
          );
          return remaining[0] || null;
        }
        return prev;
      });
    },
    [activeConnection, connections, persistConnections],
  );

  const setActive = useCallback(
    (connectionId: number | null) => {
      if (connectionId === null) {
        setActiveConnection(null);
        if (userEmail) {
          localStorage.removeItem(`cloudwise.activeConnection.${userEmail}`);
        }
        return;
      }

      const match = connections.find((c) => c.connectionId === connectionId);
      if (match) {
        setActiveConnection(match);
        if (userEmail) {
          localStorage.setItem(
            `cloudwise.activeConnection.${userEmail}`,
            String(connectionId),
          );
        }
      }
    },
    [connections, userEmail],
  );

  return (
    <ConnectionsContext.Provider
      value={{
        connections,
        activeConnection,
        add,
        update,
        remove,
        setActive,
      }}
    >
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections(): ConnectionsContextType {
  const context = useContext(ConnectionsContext);
  if (!context) {
    throw new Error('useConnections must be used within a ConnectionsProvider');
  }
  return context;
}
