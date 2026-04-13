import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="py-20 border-t border-outline-variant/10 bg-surface">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <div className="text-xl font-heading font-bold text-primary mb-6">Festival Companion</div>
          <p className="text-sm text-on-surface-variant">
            The definitive platform for the modern festival traveler. Transparency and precision in every comparison.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest font-bold text-outline-variant mb-6">Navigate</h4>
          <ul className="space-y-4 text-sm text-on-surface">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link href="/compare" className="hover:text-primary transition-colors">Compare</Link></li>
            <li><Link href="/saved" className="hover:text-primary transition-colors">Saved Trips</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest font-bold text-outline-variant mb-6">Features</h4>
          <ul className="space-y-4 text-sm text-on-surface">
            <li><span className="text-on-surface-variant">Cost Comparison</span></li>
            <li><span className="text-on-surface-variant">Price Prediction</span></li>
            <li><span className="text-on-surface-variant">Transport Analysis</span></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest font-bold text-outline-variant mb-6">System</h4>
          <ul className="space-y-4 text-sm text-on-surface">
            <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Panel</Link></li>
            <li><span className="text-on-surface-variant">Data Quality</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-outline-variant/5 text-center text-[10px] uppercase tracking-[0.2em] text-outline-variant">
        Festival Companion. Cinematic precision travel. Next.js + Prisma + SQLite.
      </div>
    </footer>
  );
}
