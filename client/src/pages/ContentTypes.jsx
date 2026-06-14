import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const FIELD_TYPES = ['text', 'richtext', 'number', 'boolean', 'date', 'media'];

export default function ContentTypes() {
  const [types, setTypes] = useState([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [fields, setFields] = useState([{ name: '', type: 'text' }]);
  const { user } = useAuth();

  function load() {
    api.getContentTypes().then(setTypes).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  function updateField(i, key, value) {
    setFields((fs) => fs.map((f, idx) => (idx === i ? { ...f, [key]: value } : f)));
  }

  function addField() {
    setFields((fs) => [...fs, { name: '', type: 'text' }]);
  }

  function removeField(i) {
    setFields((fs) => fs.filter((_, idx) => idx !== i));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createContentType({ name, label, fields: fields.filter((f) => f.name) });
      setName('');
      setLabel('');
      setFields([{ name: '', type: 'text' }]);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this content type and all its entries?')) return;
    await api.deleteContentType(id);
    load();
  }

  return (
    <div>
      <h1>Content Types</h1>
      {error && <div className="error">{error}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>Label</th>
            <th>Name</th>
            <th>Fields</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {types.map((t) => (
            <tr key={t.id}>
              <td>
                <Link to={`/entries/${t.name}`}>{t.label}</Link>
              </td>
              <td>{t.name}</td>
              <td>{t.fields.map((f) => f.name).join(', ')}</td>
              <td>
                {user?.role === 'admin' && (
                  <button className="link" onClick={() => handleDelete(t.id)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {user?.role === 'admin' && (
        <form className="card" onSubmit={handleCreate}>
          <h2>New content type</h2>
          <label>
            Label (display name)
            <input value={label} onChange={(e) => setLabel(e.target.value)} required />
          </label>
          <label>
            Name (lowercase, e.g. blog_post)
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              pattern="[a-z][a-z0-9_]*"
              required
            />
          </label>

          <h3>Fields</h3>
          {fields.map((f, i) => (
            <div key={i} className="field-row">
              <input
                placeholder="field name"
                value={f.name}
                onChange={(e) => updateField(i, 'name', e.target.value)}
              />
              <select value={f.type} onChange={(e) => updateField(i, 'type', e.target.value)}>
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button type="button" className="link" onClick={() => removeField(i)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addField}>
            + Add field
          </button>

          <div>
            <button type="submit">Create content type</button>
          </div>
        </form>
      )}
    </div>
  );
}
