import { useEffect, useState } from "react";
import {
  api,
  clearToken,
  getToken,
  setToken,
  documentsApi,
} from "./lib/api";

import type { DocumentItem } from "./lib/api";

export default function App() {
  // ======================
  // Auth state
  // ======================
  const [email, setEmail] = useState("kenny@example.com");
  const [password, setPassword] = useState("pwd123");
  const [me, setMe] = useState<{ id: number; email: string } | null>(null);

  // ======================
  // Documents state
  // ======================
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState<DocumentItem | null>(null);

  // UI / error
  const [err, setErr] = useState("");

  // ======================
  // Auth actions
  // ======================
  async function onLogin() {
    setErr("");
    try {
      // 1. login → get JWT
      const r = await api.login(email, password);
      setToken(r.access_token);

      // 2. fetch current user
      const user = await api.me();
      setMe(user);

      // 3. load documents after login
      await loadDocuments();
    } catch (e: any) {
      setErr(e.message || String(e));
    }
  }

  function onLogout() {
    clearToken();
    setMe(null);
    setDocuments([]);
    setEditing(null);
  }

  // ======================
  // Documents actions
  // ======================
  async function loadDocuments() {
    const docs = await documentsApi.list();
    setDocuments(docs);
  }

  async function onCreateOrUpdate() {
    setErr("");

    if (!title.trim() || !content.trim()) {
      setErr("Title and content are required");
      return;
    }

    try {
      if (editing) {
        // Update existing document
        await documentsApi.update(editing.id, title, content);
      } else {
        // Create new document
        await documentsApi.create(title, content);
      }

      // Reset form
      setTitle("");
      setContent("");
      setEditing(null);

      // Refresh list
      await loadDocuments();
    } catch (e: any) {
      setErr(e.message || String(e));
    }
  }

  // ======================
  // On page load:
  // if token exists, try auto-login
  // ======================
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    api
      .me()
      .then(async (user) => {
        setMe(user);
        await loadDocuments();
      })
      .catch(() => {
        clearToken();
      });
  }, []);

  // ======================
  // UI
  // ======================
  return (
  <div className="min-h-screen bg-gray-50">
    {/* ======================
        Not logged in: center card
       ====================== */}
    {!me ? (
      <div className="h-dvh flex items-center justify-center px-6 -translate-y-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow ring-1 ring-gray-200 space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Knowledge Hub
            </h1>
            <p className="text-sm text-gray-600">Sign in to continue</p>
          </div>

          {err && (
            <div className="rounded bg-red-100 p-3 text-red-800">{err}</div>
          )}

          <div className="space-y-3">
            <input
              className="w-full rounded-lg border p-2"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded-lg border p-2"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="w-full rounded-lg bg-gray-900 p-2 text-white hover:bg-black"
              onClick={onLogin}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    ) : (
      /* ======================
          Logged in: top bar + content
         ====================== */
      <div>
        {/* Top bar */}
        <div className="sticky top-0 bg-white/80 backdrop-blur border-b">
          <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">
              Knowledge Hub
            </h1>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{me.email}</span>
              <button
                className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
          {err && (
            <div className="rounded bg-red-100 p-3 text-red-800">{err}</div>
          )}

          {/* ======================
              Create / Edit document
             ====================== */}
          <div className="rounded bg-white p-6 shadow space-y-3">
            <h2 className="font-semibold">
              {editing ? "Edit document" : "New document"}
            </h2>

            <input
              className="w-full rounded border p-2"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="w-full rounded border p-2 h-32"
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="flex gap-2">
              <button
                className="rounded bg-gray-900 px-4 py-2 text-white"
                onClick={onCreateOrUpdate}
              >
                {editing ? "Save" : "Create"}
              </button>

              {editing && (
                <button
                  className="rounded bg-gray-200 px-4 py-2"
                  onClick={() => {
                    setEditing(null);
                    setTitle("");
                    setContent("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* ======================
              Documents list
             ====================== */}
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded bg-white p-4 shadow space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{doc.title}</h3>
                  <button
                    className="text-sm text-blue-600"
                    onClick={() => {
                      setEditing(doc);
                      setTitle(doc.title);
                      setContent(doc.content);
                    }}
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {doc.content}
                </p>
              </div>
            ))}

            {documents.length === 0 && (
              <div className="text-sm text-gray-500">No documents yet.</div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
}