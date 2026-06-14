import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';

export default function PublicList() {
  const { contentType } = useParams();
  const [type, setType] = useState(null);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getPublicContentTypes()
      .then((types) => setType(types.find((t) => t.name === contentType)))
      .catch((e) => setError(e.message));
    api.getPublicEntries(contentType).then(setEntries).catch((e) => setError(e.message));
  }, [contentType]);

  const titleField = type?.fields.find((f) => f.name === 'title')?.name || type?.fields[0]?.name;
  const imageField = type?.fields.find((f) => f.type === 'media')?.name;

  return (
    <div>
      <h1>{type?.label || contentType}</h1>
      {error && <div className="error">{error}</div>}
      <div className="grid">
        {entries.map((entry) => (
          <Link to={`/site/${contentType}/${entry.id}`} key={entry.id} className="card-link">
            {imageField && entry.data[imageField] && (
              <img src={entry.data[imageField]} alt="" className="card-image" />
            )}
            <div className="card-title">
              {titleField ? String(entry.data[titleField]) : `Entry #${entry.id}`}
            </div>
          </Link>
        ))}
      </div>
      {entries.length === 0 && !error && <p>No published entries yet.</p>}
    </div>
  );
}
