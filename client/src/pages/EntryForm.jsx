import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

export default function EntryForm() {
  const { contentType, id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [type, setType] = useState(null);
  const [data, setData] = useState({});
  const [status, setStatus] = useState('draft');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getContentTypes().then((types) => {
      const t = types.find((t) => t.name === contentType);
      setType(t);
      if (!isNew) {
        api.getEntry(contentType, id).then((entry) => {
          setData(entry.data);
          setStatus(entry.status);
        });
      } else {
        const initial = {};
        t.fields.forEach((f) => {
          initial[f.name] = f.type === 'boolean' ? false : '';
        });
        setData(initial);
      }
    });
  }, [contentType, id]);

  function updateField(name, value) {
    setData((d) => ({ ...d, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (isNew) await api.createEntry(contentType, data, status);
      else await api.updateEntry(contentType, id, data, status);
      navigate(`/entries/${contentType}`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!type) return <div>Loading...</div>;

  return (
    <div>
      <h1>
        {isNew ? 'New' : 'Edit'} {type.label}
      </h1>
      {error && <div className="error">{error}</div>}
      <form className="card" onSubmit={handleSubmit}>
        {type.fields.map((f) => (
          <label key={f.name}>
            {f.name} ({f.type})
            {f.type === 'boolean' ? (
              <input
                type="checkbox"
                checked={!!data[f.name]}
                onChange={(e) => updateField(f.name, e.target.checked)}
              />
            ) : f.type === 'richtext' ? (
              <textarea
                rows={6}
                value={data[f.name] ?? ''}
                onChange={(e) => updateField(f.name, e.target.value)}
              />
            ) : (
              <input
                type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                value={data[f.name] ?? ''}
                onChange={(e) => updateField(f.name, e.target.value)}
              />
            )}
          </label>
        ))}

        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        <button type="submit">Save</button>
      </form>
    </div>
  );
}
