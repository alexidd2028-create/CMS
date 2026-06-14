import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';

export default function PublicDetail() {
  const { contentType, id } = useParams();
  const [type, setType] = useState(null);
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getPublicContentTypes()
      .then((types) => setType(types.find((t) => t.name === contentType)))
      .catch((e) => setError(e.message));
    api.getPublicEntry(contentType, id).then(setEntry).catch((e) => setError(e.message));
  }, [contentType, id]);

  if (error) return <div className="error">{error}</div>;
  if (!type || !entry) return <div>Loading...</div>;

  return (
    <div>
      {type.fields.map((f) => (
        <div key={f.name} className="field-display">
          <h3>{f.name}</h3>
          {f.type === 'richtext' ? (
            <p style={{ whiteSpace: 'pre-wrap' }}>{entry.data[f.name]}</p>
          ) : f.type === 'boolean' ? (
            <p>{entry.data[f.name] ? 'Yes' : 'No'}</p>
          ) : (
            <p>{String(entry.data[f.name] ?? '')}</p>
          )}
        </div>
      ))}
    </div>
  );
}
