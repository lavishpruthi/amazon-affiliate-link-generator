import React, { useEffect, useState } from "react";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x300?text=Product+Image";

export default function App() {
  const [storeId, setStoreId] = useState(() => localStorage.getItem("storeId") || "lavish057-21");
  const [inputUrl, setInputUrl] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [cards, setCards] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cards") || "[]");
    } catch (e) {
      return [];
    }
  });
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editImage, setEditImage] = useState("");

  useEffect(() => localStorage.setItem("cards", JSON.stringify(cards)), [cards]);
  useEffect(() => localStorage.setItem("storeId", storeId), [storeId]);

  // Extract ASIN from Amazon URL
  const extractASIN = (raw) => {
    try {
      const url = new URL(raw.trim());
      const p = url.pathname;
      const patterns = [
        /\/dp\/([A-Z0-9]{10})/i,
        /\/gp\/product\/([A-Z0-9]{10})/i,
        /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
        /\/product\/([A-Z0-9]{10})/i,
        /\/([A-Z0-9]{10})(?:[/?]|$)/i,
      ];
      for (const re of patterns) {
        const m = p.match(re);
        if (m && m[1]) return m[1];
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  // Build affiliate link from ASIN
  const getAffiliateLinkFromAsin = (rawUrl, asin) => {
    try {
      const url = new URL(rawUrl.trim());
      const host = url.hostname;
      const base = `${url.protocol}//${host}`;
      const clean = `${base}/dp/${asin}`;
      const language = host.endsWith(".in") ? "en_IN" : "en_US";
      return `${clean}/?tag=${encodeURIComponent(storeId)}&linkCode=ll1&language=${language}&ref_=as_li_ss_tl`;
    } catch (e) {
      return null;
    }
  };

  // Generate affiliate link
  const generate = () => {
  const url = inputUrl.trim();
  if (!url) return alert("Please enter a URL.");

  let affiliateUrl = url;

  // If the URL already has query parameters
  if (url.includes("?")) {
    affiliateUrl += `&tag=${encodeURIComponent(storeId)}`;
  } else {
    affiliateUrl += `?tag=${encodeURIComponent(storeId)}`;
  }

  setAffiliateLink(affiliateUrl);
};

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputUrl(text || "");
    } catch (e) {
      alert("Unable to read clipboard. Make sure your browser allows clipboard access (works on https or localhost).");
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    }, () => {
      alert("Unable to copy to clipboard");
    });
  };

  const addCard = () => {
    if (!affiliateLink) return alert("Generate affiliate link first.");
    const asin = extractASIN(inputUrl);
    const newCard = {
      id: Date.now(),
      asin: asin || "",
      title: `Product ${asin || ""}`,
      link: affiliateLink,
      image: PLACEHOLDER_IMAGE,
    };
    setCards((s) => [newCard, ...s]);
    setInputUrl("");
    setAffiliateLink("");
  };

  const startEdit = (card) => {
    setEditingId(card.id);
    setEditTitle(card.title);
    setEditImage(card.image === PLACEHOLDER_IMAGE ? "" : card.image);
  };

  const saveEdit = (id) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, title: editTitle || c.title, image: editImage || PLACEHOLDER_IMAGE }
          : c
      )
    );
    setEditingId(null);
    setEditTitle("");
    setEditImage("");
  };

  const deleteCard = (id) => {
    if (!window.confirm("Delete this card?")) return;
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f2f2f2", fontFamily: "Arial, Helvetica, sans-serif", padding: 24 }}>
      <h1 style={{ textAlign: "center", color: "#232f3e" }}>🛒 Amazon Affiliate Hub</h1>

      <div style={{ maxWidth: 820, margin: "18px auto" }}>
        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}>
          <h2 style={{ marginTop: 0, color: "#232f3e" }}>Affiliate Link Generator</h2>

          <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Store / Affiliate ID</label>
          <input
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            placeholder="yourtag-21"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 12 }}
          />

          <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Amazon product link</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste product URL here"
              style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
            />
            <button onClick={pasteFromClipboard} style={{ background: "#232f3e", color: "white", border: "none", padding: "10px 14px", borderRadius: 8 }}>Paste</button>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={generate} style={{ flex: 1, background: "#ff9900", color: "#111", border: "none", padding: 12, borderRadius: 8, fontWeight: 700 }}>Generate</button>
            <button onClick={() => { if (affiliateLink) copyToClipboard(affiliateLink); }} style={{ background: "#0066c0", color: "white", border: "none", padding: 12, borderRadius: 8 }}>Copy Link</button>
          </div>

          {affiliateLink && (
            <div style={{ marginTop: 12, background: "#fafafa", padding: 12, borderRadius: 8, border: "1px solid #eee" }}>
              <div style={{ fontSize: 13, marginBottom: 8, color: "#333" }}>Generated affiliate link</div>
              <div style={{ wordBreak: "break-all", fontSize: 14, marginBottom: 8 }}>{affiliateLink}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addCard} style={{ background: "#232f3e", color: "white", border: "none", padding: "8px 12px", borderRadius: 8 }}>➕ Add as Card</button>
                <button onClick={() => copyToClipboard(affiliateLink)} style={{ background: "#0066c0", color: "white", border: "none", padding: "8px 12px", borderRadius: 8 }}>Copy</button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 12, fontSize: 12, color: "#555" }}>
            Tip: paste a normal Amazon product URL (it must include the product code like /dp/B0FGVQBNSB). For short links like amzn.to, first expand them in the browser.
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h2 style={{ color: "#232f3e" }}>🔥 Featured Deals</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
          {cards.map((card) => (
            <div key={card.id} style={{ background: "white", borderRadius: 12, padding: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", position: "relative" }}>
              {editingId === card.id ? (
                <div>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" style={{ width: "100%", padding: 8, marginBottom: 8, borderRadius: 6, border: "1px solid #ddd" }} />
                  <input value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="Image URL (optional)" style={{ width: "100%", padding: 8, marginBottom: 8, borderRadius: 6, border: "1px solid #ddd" }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => saveEdit(card.id)} style={{ flex: 1, background: "#232f3e", color: "white", border: "none", padding: 10, borderRadius: 8 }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ flex: 1, background: "#ddd", border: "none", padding: 10, borderRadius: 8 }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <img src={card.image || PLACEHOLDER_IMAGE} alt={card.title} style={{ width: "100%", height: 180, objectFit: "contain", borderRadius: 8, background: "#fff" }} />
                  <div style={{ paddingTop: 8 }}>
                    <div style={{ fontWeight: 700, color: "#232f3e", minHeight: 44 }}>{card.title}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <a href={card.link} target="_blank" rel="noopener noreferrer" style={{ background: "#ff9900", color: "#111", padding: "8px 12px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>Buy Now →</a>
                      <button onClick={() => copyToClipboard(card.link)} style={{ background: "#0066c0", color: "white", border: "none", padding: "8px 12px", borderRadius: 8 }}>Copy</button>
                      <button onClick={() => startEdit(card)} style={{ background: "#232f3e", color: "white", border: "none", padding: "8px 12px", borderRadius: 8 }}>Edit</button>
                      <button onClick={() => deleteCard(card.id)} style={{ background: "#d9534f", color: "white", border: "none", padding: "8px 12px", borderRadius: 8 }}>Delete</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}

          {cards.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#666" }}>
              No cards yet — add product cards by pasting Amazon product links.
            </div>
          )}
        </div>
      </div>

      <footer style={{ textAlign: "center", marginTop: 36, color: "#999" }}>
        <small>Local-only admin protection. For public hosting use a real authentication system.</small>
      </footer>
    </div>
  );
}
