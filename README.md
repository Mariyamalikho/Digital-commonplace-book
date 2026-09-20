<div align="center">
  <h1>📖 Digital Commonplace Book</h1>
  <p>A beautifully tactile, 3D digital journaling experience designed for writers, thinkers, and lifelong learners.</p>

  <!-- TODO: Add a GIF or screenshot of the 3D book cover and page flipping here! -->
  <img src="https://via.placeholder.com/800x400?text=Replace+with+App+Screenshot" alt="Digital Commonplace Book App Screenshot" width="800" />
</div>

<br />

Digital Commonplace Book is an interactive web application that perfectly bridges the gap between the tactile, physical experience of a real notebook and the power of modern cloud technology. With a realistic 3D CSS spine, page-turning mechanics, and multi-language support, it provides a private, aesthetic space to collect your thoughts, marginalia, sketches, and memories.

---

## ✨ Key Features

### 📖 The Tactile Experience
- **Realistic 3D UI**: A beautifully crafted book cover with a realistic spine, hinge groove, and dynamic shadows.
- **Physical Page Flipping**: Smooth, hardware-accelerated 3D page-turning animations that make it feel like a real book.
- **Page Tearing**: Don't like a page? Physically "tear" it out of the book with a custom CSS animation.
- **Customizable Covers**: Choose from elegant themes (Midnight, Emerald, Obsidian, Dark Academia) and CSS patterns to personalize your journal.

### ✍️ Powerful Content Creation
- **Rich Media**: Embed images and voice notes directly into your entries.
- **Drawing Canvas**: Sketch or write by hand directly onto the page.
- **Bi-Directional Language Support**: Unique per-page toggle for **Urdu (RTL)** and **English (LTR)** writing modes, allowing you to mix languages without breaking formatting.

### ☁️ Cloud & Security
- **Multiple Journals**: Manage, create, and seamlessly switch between multiple different notebooks.
- **Secure Cloud Storage**: Real-time auto-saving backed by Supabase (PostgreSQL) and Firebase.
- **Role-Based Access Control**: Securely share a link to your book with friends. Assign permissions (Visitor, Editor) using secure token tunnels.
- **Row Level Security (RLS)**: Enterprise-grade security ensures your private thoughts remain strictly yours.
- **Responsive Design**: Flawlessly scales from a majestic desktop view down to a perfectly proportioned mobile experience.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Backend/Database:** Supabase (PostgreSQL)
- **Media Storage:** Firebase
- **Deployment:** Vercel

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine
- A Supabase project set up with the provided SQL scripts

### Installation
Clone the repository:
```bash
git clone https://github.com/Mariyamalikho/Digital-commonplace-book.git
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

---

## 📸 Screenshots

<!-- TODO: Add your beautiful screenshots here! Replace the placeholder links below with your actual images once you take them. -->

| Book Cover | Page Spread | Mobile View |
| :---: | :---: | :---: |
| <img src="https://via.placeholder.com/300x400?text=Cover+Screenshot" alt="Cover" /> | <img src="https://via.placeholder.com/300x400?text=Open+Book" alt="Open Book" /> | <img src="https://via.placeholder.com/300x400?text=Mobile+UI" alt="Mobile UI" /> |

---

## 🌟 Roadmap & Future Plans

- [x] Multiple books support
- [x] Responsive mobile UI & Aspect Ratio fixing
- [x] Right-to-Left (Urdu) language support
- [ ] Global Search across all journals
- [ ] Progressive Web App (Offline mode)
- [ ] Rich Text Formatting (Markdown)
- [ ] Audio Visualizer for voice notes

---

## 🤝 Contributing

Contributions, suggestions, and feature requests are welcome. Feel free to open an Issue or submit a Pull Request.

---

## 📄 License

MIT License

<div align="center">
  Made with ❤️ by <a href="https://mariyamalikhokhar.com/">Mariyam</a>
</div>
