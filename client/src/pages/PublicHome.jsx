import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function PublicHome() {
  const [types, setTypes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPublicContentTypes().then(setTypes).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1>Site</h1>
      {error && <div className="error">{error}</div>}
      <ul>
        {types.map((t) => (
          <li key={t.id}>
            <Link to={`/site/${t.name}`}>{t.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
