import React from 'react';
import { Mail, TrendingUp, Tag } from 'lucide-react';

function BlogSidebar({ latest = [], tags = [], selectedTags = [], onTagToggle }) {
  const [email, setEmail] = React.useState('');
  return (
    <aside className="space-y-6">
      <div className="card">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-4 w-4 text-blue-300" /><h3 className="font-semibold">Latest Posts</h3></div>
          <ul className="space-y-2 text-sm">
            {latest.slice(0,5).map(p => (
              <li key={p.id} className="text-gray-300 hover:text-white"><a href={`/blog/${p.id}`}>{p.title}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-3"><Tag className="h-4 w-4 text-blue-300" /><h3 className="font-semibold">Popular Tags</h3></div>
          <div className="flex flex-wrap gap-2">
            {tags.map(t => {
              const isSelected = selectedTags.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => onTagToggle && onTagToggle(t)}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                    isSelected
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-muted border-border text-gray-300 hover:border-blue-500/50 hover:text-blue-300'
                  }`}
                >
                  #{t}
                </button>
              );
            })}
          </div>
          {selectedTags.length > 0 && (
            <button
              onClick={() => selectedTags.forEach(tag => onTagToggle && onTagToggle(tag))}
              className="mt-3 text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Clear all tags
            </button>
          )}
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-3"><Mail className="h-4 w-4 text-blue-300" /><h3 className="font-semibold">Newsletter</h3></div>
          <div className="text-sm text-gray-400 mb-3">Get weekly insights in your inbox.</div>
          <div className="flex gap-2">
            <input className="input" placeholder="Email address" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <button className="btn btn-primary" onClick={()=>console.log('subscribe', email)}>Subscribe</button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default BlogSidebar;


