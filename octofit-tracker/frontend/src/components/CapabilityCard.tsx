import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  loadItems: () => Promise<T[]>;
  emptyMessage: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, loadItems, emptyMessage, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    loadItems()
      .then((values) => {
        if (isCurrent) setItems(Array.isArray(values) ? values : []);
      })
      .catch(() => {
        if (isCurrent) setFailed(true);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => { isCurrent = false; };
  }, [loadItems]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {loading ? <p role="status">Loading {title.toLowerCase()}...</p>
      : failed ? <p role="alert">Unable to load {title.toLowerCase()}. Please try again.</p>
        : items.length === 0 ? <p role="status">{emptyMessage}</p>
          : <ul className="list-unstyled mb-0">{items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>}
  </div></section>;
}
