import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';

export default function Entries() {
  const { contentType } = useParams();
  const [type, setType] = useState(null);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  function load() {
    api
      .getContentTypes()
      .then((types) => setType(types.find((t) => t.name === contentType)))
      .catch((e) => setError(e.message));
    api.getEntries(contentType).then(setEntries).catch((e) => setError(e.message));
  }

  useEffect(load, [contentType]);

  async function handleDelete(id) {
    if (!confirm('Delete this entry?')) return;
    await api.deleteEntry(contentType, id);
    load();
  }

  if (!type) return <div>{error || 'Loading...'}</div>;

  return (
    <div>
      <h1>{type.label}</h1>
      {error && <div className="error">{error}</div>}
      <Link to={`/entries/${contentType}/new`}>
        <button>+ New entry</button>
      </Link>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            {type.fields.map((f) => (
              <th key={f.name}>{f.name}</th>
            ))}
            <th>Status</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>
                <Link to={`/entries/${contentType}/${entry.id}`}>{entry.id}</Link>
              </td>
              {type.fields.map((f) => (
                <td key={f.name}>{String(entry.data[f.name] ?? '')}</td>
              ))}
              <td>{entry.status}</td>
              <td>{entry.updated_at}</td>
              <td>
                <button className="link" onClick={() => handleDelete(entry.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
