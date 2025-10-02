import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, Sparkles, BookOpen, Clock, Share2, Copy, Download, Star, Bold, Italic, Underline, List, ListOrdered, Quote, Code, Undo, Redo } from 'lucide-react';

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: 'from-indigo-400 to-purple-400' });
  const [editNote, setEditNote] = useState({ title: '', content: '', color: '' });
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareNote, setShareNote] = useState(null);

  const editorRef = useRef(null);
  const editEditorRef = useRef(null);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('myNotes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('myNotes', JSON.stringify(notes));
      } catch (error) {
        console.error('Error saving notes:', error);
      }
    }
  }, [notes, isLoading]);

  const colorOptions = [
    'from-purple-400 to-pink-400',
    'from-blue-400 to-cyan-400',
    'from-green-400 to-emerald-400',
    'from-yellow-400 to-orange-400',
    'from-red-400 to-pink-400',
    'from-indigo-400 to-purple-400',
    'from-cyan-400 to-blue-400',
    'from-emerald-400 to-teal-400'
  ];

  const getPlainText = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const filteredNotes = notes.filter(note => 
    (note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     getPlainText(note.content).toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterFavorites ? note.isFavorite : true)
  );

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const formatText = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      execCommand(command, value);
    }
  };

  const formatEditText = (command, value = null) => {
    if (editEditorRef.current) {
      editEditorRef.current.focus();
      execCommand(command, value);
    }
  };

  const handleCreateNote = () => {
    const content = editorRef.current ? editorRef.current.innerHTML : '';
    if (newNote.title.trim() || content.trim()) {
      const note = {
        id: Date.now(),
        title: newNote.title || 'Untitled Note',
        content: content,
        color: newNote.color,
        createdAt: new Date().toISOString(),
        isFavorite: false
      };
      setNotes([note, ...notes]);
      setNewNote({ title: '', content: '', color: colorOptions[Math.floor(Math.random() * colorOptions.length)] });
      if (editorRef.current) editorRef.current.innerHTML = '';
      setIsCreating(false);
    }
  };

  const handleEditStart = (note) => {
    setEditingId(note.id);
    setEditNote({ title: note.title, content: note.content, color: note.color });
  };

  const handleEditSave = () => {
    const content = editEditorRef.current ? editEditorRef.current.innerHTML : editNote.content;
    setNotes(notes.map(note => 
      note.id === editingId 
        ? { ...note, title: editNote.title || 'Untitled Note', content: content, color: editNote.color }
        : note
    ));
    setEditingId(null);
    setEditNote({ title: '', content: '', color: '' });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditNote({ title: '', content: '', color: '' });
  };

  const handleDelete = (id) => setNotes(notes.filter(note => note.id !== id));

  const handleToggleFavorite = (id) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
    ));
  };

  const handleDuplicate = (note) => {
    const duplicatedNote = {
      ...note,
      id: Date.now(),
      title: `${note.title} (Copy)`,
      createdAt: new Date().toISOString()
    };
    setNotes([duplicatedNote, ...notes]);
  };

  const handleShare = (note) => {
    setShareNote(note);
    setShowShareModal(true);
  };

  const handleCopyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExport = (note) => {
    const plainText = getPlainText(note.content);
    const content = `${note.title}\n\n${plainText}\n\nCreated: ${formatDate(note.createdAt)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleWebShare = async (note) => {
    const plainText = getPlainText(note.content);
    if (navigator.share) {
      try {
        await navigator.share({ title: note.title, text: plainText, url: window.location.href });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyToClipboard(`${note.title}\n\n${plainText}`);
    }
    setShowShareModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-purple-200 text-lg font-medium">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      <style>{`
        [contentEditable] {
          min-height: 150px;
          outline: none;
        }
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(196, 181, 253, 0.6);
          pointer-events: none;
        }
        [contentEditable] strong { font-weight: bold; }
        [contentEditable] em { font-style: italic; }
        [contentEditable] u { text-decoration: underline; }
        [contentEditable] ul { list-style-type: disc; padding-left: 20px; margin: 10px 0; }
        [contentEditable] ol { list-style-type: decimal; padding-left: 20px; margin: 10px 0; }
        [contentEditable] li { margin: 5px 0; }
        [contentEditable] blockquote {
          border-left: 4px solid rgba(168, 85, 247, 0.5);
          padding: 12px 16px;
          margin: 16px 0;
          background: rgba(168, 85, 247, 0.1);
          border-radius: 4px;
          font-style: italic;
        }
        [contentEditable] pre {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 12px;
          font-family: monospace;
          margin: 12px 0;
          overflow-x: auto;
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <BookOpen className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  My Notes
                </h1>
                <p className="text-purple-200">Capture ideas with rich formatting</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilterFavorites(!filterFavorites)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  filterFavorites 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                } border border-white/20`}
              >
                <Star size={16} className={filterFavorites ? 'fill-current' : ''} />
                <span className="text-sm font-medium">Favorites</span>
              </button>
              <button
                onClick={() => setIsCreating(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isCreating 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                } border border-white/20`}
              >
                <Plus size={16} />
                <span className="text-sm font-medium">New</span>
              </button>
            </div>
          </div>
          
          <div className="relative mt-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
            <input
              type="text"
              placeholder="Search your thoughts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {isCreating && (
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-purple-300" size={24} />
              <h2 className="text-2xl font-bold text-white">Create New Note</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-purple-200 mb-3 font-medium">Choose a color:</p>
              <div className="flex gap-3 flex-wrap">
                {colorOptions.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setNewNote({ ...newNote, color })}
                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${color} transition-all duration-200 ${
                      newNote.color === color ? 'ring-4 ring-white/50 scale-110' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full p-4 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />

            <div className="mb-4 p-3 backdrop-blur-lg bg-white/5 border border-white/20 rounded-xl">
              <div className="flex flex-wrap gap-2">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('bold'); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white" title="Bold (Ctrl+B)">
                  <Bold size={16} />
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('italic'); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white" title="Italic (Ctrl+I)">
                  <Italic size={16} />
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('underline'); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white" title="Underline (Ctrl+U)">
                  <Underline size={16} />
                </button>
                <div className="w-px bg-white/20 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('insertUnorderedList'); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white" title="Bullet List">
                  <List size={16} />
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('insertOrderedList'); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white" title="Numbered List">
                  <ListOrdered size={16} />
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('formatBlock', 'blockquote'); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white" title="Quote">
                  <Quote size={16} />
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('formatBlock', 'pre'); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white" title="Code">
                  <Code size={16} />
                </button>
                <div className="w-px bg-white/20 mx-1"></div>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('undo'); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white" title="Undo">
                  <Undo size={16} />
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText('redo'); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white" title="Redo">
                  <Redo size={16} />
                </button>
              </div>
            </div>

            <div
              ref={editorRef}
              contentEditable
              className="w-full p-4 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl text-white mb-6 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              data-placeholder="Type your note here... Try selecting text and using the toolbar!"
              suppressContentEditableWarning
            />

            <div className="flex gap-3">
              <button
                onClick={handleCreateNote}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
              >
                <Save size={18} />
                Save Note
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewNote({ title: '', content: '', color: colorOptions[0] });
                  if (editorRef.current) editorRef.current.innerHTML = '';
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="text-8xl mb-4 animate-bounce">📝</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {searchTerm || filterFavorites ? 'No notes found' : 'Ready to start?'}
              </h3>
              <p className="text-purple-200 text-lg">
                {searchTerm || filterFavorites ? 'Try different filters' : 'Create your first note with rich formatting!'}
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className="group transform hover:scale-105 transition-all duration-300">
                <div className={`backdrop-blur-lg bg-gradient-to-br ${note.color} rounded-2xl shadow-2xl overflow-hidden relative`}>
                  {editingId === note.id ? (
                    <div className="p-6 backdrop-blur-lg bg-black/20">
                      <div className="mb-3 p-2 bg-white/10 rounded-lg flex flex-wrap gap-1">
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); formatEditText('bold'); }} className="p-1 bg-white/10 hover:bg-white/20 rounded text-white"><Bold size={14} /></button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); formatEditText('italic'); }} className="p-1 bg-white/10 hover:bg-white/20 rounded text-white"><Italic size={14} /></button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); formatEditText('insertUnorderedList'); }} className="p-1 bg-white/10 hover:bg-white/20 rounded text-white"><List size={14} /></button>
                        <button type="button" onMouseDown={(e) => { e.preventDefault(); formatEditText('insertOrderedList'); }} className="p-1 bg-white/10 hover:bg-white/20 rounded text-white"><ListOrdered size={14} /></button>
                      </div>
                      <input
                        type="text"
                        value={editNote.title}
                        onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white mb-3"
                      />
                      <div
                        ref={editEditorRef}
                        contentEditable
                        dangerouslySetInnerHTML={{ __html: editNote.content }}
                        className="w-full min-h-[120px] p-3 bg-white/20 border border-white/30 rounded-xl text-white mb-4"
                        suppressContentEditableWarning
                      />
                      <div className="flex gap-2">
                        <button onClick={handleEditSave} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                          <Save size={14} />Save
                        </button>
                        <button onClick={handleEditCancel} className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                          <X size={14} />Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-6 backdrop-blur-lg bg-black/20">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-white flex-1 mr-2">{note.title}</h3>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleToggleFavorite(note.id)} className={`p-2 rounded-lg ${note.isFavorite ? 'bg-yellow-500/30 text-yellow-300' : 'bg-white/10 text-white/60'}`}>
                              <Star size={16} className={note.isFavorite ? 'fill-current' : ''} />
                            </button>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleShare(note)} className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-white rounded-lg" title="Share"><Share2 size={14} /></button>
                              <button onClick={() => handleDuplicate(note)} className="p-2 bg-green-500/20 hover:bg-green-500/40 text-white rounded-lg" title="Copy"><Copy size={14} /></button>
                              <button onClick={() => handleExport(note)} className="p-2 bg-purple-500/20 hover:bg-purple-500/40 text-white rounded-lg" title="Export"><Download size={14} /></button>
                              <button onClick={() => handleEditStart(note)} className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg" title="Edit"><Edit2 size={14} /></button>
                              <button onClick={() => handleDelete(note.id)} className="p-2 bg-red-500/20 hover:bg-red-500/40 text-white rounded-lg" title="Delete"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        </div>
                        <div className="text-white/90" dangerouslySetInnerHTML={{ __html: note.content }} style={{ maxHeight: '100px', overflow: 'hidden' }} />
                      </div>
                      <div className="px-6 py-3 backdrop-blur-lg bg-black/30 border-t border-white/20">
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <Clock size={14} />
                          {formatDate(note.createdAt)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {showShareModal && shareNote && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Share Note</h3>
              <div className="space-y-3">
                <button onClick={() => handleWebShare(shareNote)} className="w-full flex items-center gap-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl text-white">
                  <Share2 size={20} />Share
                </button>
                <button onClick={() => { handleCopyToClipboard(`${shareNote.title}\n\n${getPlainText(shareNote.content)}`); setShowShareModal(false); }} className="w-full flex items-center gap-3 p-4 bg-green-500/20 hover:bg-green-500/30 rounded-xl text-white">
                  <Copy size={20} />Copy
                </button>
                <button onClick={() => { handleExport(shareNote); setShowShareModal(false); }} className="w-full flex items-center gap-3 p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-white">
                  <Download size={20} />Export
                </button>
              </div>
              <button onClick={() => setShowShareModal(false)} className="w-full mt-4 p-3 bg-gray-500/20 hover:bg-gray-500/30 rounded-xl text-white">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 backdrop-blur-lg bg-white/10 border border-white/20 rounded-full px-6 py-3">
            <Sparkles className="text-purple-300" size={16} />
            <p className="text-purple-200 font-medium">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              {notes.filter(n => n.isFavorite).length > 0 && ` • ${notes.filter(n => n.isFavorite).length} favorites`}
              <span className="text-purple-300 ml-2">• Auto-saved</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}