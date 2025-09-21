import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, Sparkles, BookOpen, Clock, Share2, Copy, Download, Heart, Star, Filter } from 'lucide-react';

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

  // Load notes from localStorage on app start
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('myNotes');
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error('Error loading notes from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('myNotes', JSON.stringify(notes));
      } catch (error) {
        console.error('Error saving notes to localStorage:', error);
        if (error.name === 'QuotaExceededError') {
          alert('Storage quota exceeded! Please delete some notes to free up space.');
        }
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

  // Filter notes based on search term and favorites
  const filteredNotes = notes
    .filter(note => 
      (note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       note.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterFavorites ? note.isFavorite : true)
    );

  // Create new note
  const handleCreateNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note = {
        id: Date.now(),
        title: newNote.title || 'Untitled Note',
        content: newNote.content,
        color: newNote.color,
        createdAt: new Date().toISOString(),
        isFavorite: false
      };
      setNotes([note, ...notes]);
      setNewNote({ title: '', content: '', color: colorOptions[Math.floor(Math.random() * colorOptions.length)] });
      setIsCreating(false);
    }
  };

  // Start editing a note
  const handleEditStart = (note) => {
    setEditingId(note.id);
    setEditNote({ title: note.title, content: note.content, color: note.color });
  };

  // Save edited note
  const handleEditSave = () => {
    setNotes(notes.map(note => 
      note.id === editingId 
        ? { ...note, title: editNote.title || 'Untitled Note', content: editNote.content, color: editNote.color }
        : note
    ));
    setEditingId(null);
    setEditNote({ title: '', content: '', color: '' });
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditingId(null);
    setEditNote({ title: '', content: '', color: '' });
  };

  // Delete note
  const handleDelete = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  // Toggle favorite
  const handleToggleFavorite = (id) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
    ));
  };

  // Duplicate note
  const handleDuplicate = (note) => {
    const duplicatedNote = {
      ...note,
      id: Date.now(),
      title: `${note.title} (Copy)`,
      createdAt: new Date().toISOString()
    };
    setNotes([duplicatedNote, ...notes]);
  };

  // Share note
  const handleShare = (note) => {
    setShareNote(note);
    setShowShareModal(true);
  };

  // Copy to clipboard
  const handleCopyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Export note as text file
  const handleExport = (note) => {
    const content = `${note.title}\n\n${note.content}\n\nCreated: ${formatDate(note.createdAt)}`;
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

  // Share via Web Share API or fallback
  const handleWebShare = async (note) => {
    const shareData = {
      title: note.title,
      text: note.content,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      const shareText = `${note.title}\n\n${note.content}`;
      handleCopyToClipboard(shareText);
    }
    setShowShareModal(false);
  };

  // Format date
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
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
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
                <p className="text-purple-200">Capture your brilliant ideas ✨</p>
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
                <Plus size={16} className={`transition-transform duration-300 ${isCreating ? 'rotate-45' : 'group-hover:rotate-90'}`} />
                <span className="text-sm font-medium">New</span>
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mt-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
            <input
              type="text"
              placeholder="Search your brilliant thoughts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Create Note Form */}
        {isCreating && (
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 mb-8 transform animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-purple-300" size={24} />
              <h2 className="text-2xl font-bold text-white">Create New Note</h2>
            </div>
            
            {/* Color Selection */}
            <div className="mb-6">
              <p className="text-purple-200 mb-3 font-medium">Choose a color theme:</p>
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
              placeholder="Give your note a catchy title..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full p-4 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
            <textarea
              placeholder="Pour your thoughts here... ✨"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows="6"
              className="w-full p-4 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 mb-6 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-300"
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
                  setNewNote({ title: '', content: '', color: colorOptions[Math.floor(Math.random() * colorOptions.length)] });
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="mb-6">
                <div className="text-8xl mb-4 animate-bounce">📝</div>
                <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6"></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {searchTerm || filterFavorites ? 'No notes found' : 'Ready to capture your thoughts?'}
              </h3>
              <p className="text-purple-200 text-lg">
                {searchTerm || filterFavorites ? 'Try different filters or search terms' : 'Create your first note and let your creativity flow!'}
              </p>
            </div>
          ) : (
            filteredNotes.map((note, index) => (
              <div 
                key={note.id} 
                className="group transform hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`backdrop-blur-lg bg-gradient-to-br ${note.color} rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden relative`}>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                  
                  {editingId === note.id ? (
                    // Edit Mode
                    <div className="p-6 backdrop-blur-lg bg-black/20">
                      {/* Color Selection for Edit */}
                      <div className="mb-4">
                        <p className="text-white/80 mb-2 text-sm font-medium">Color theme:</p>
                        <div className="flex gap-2 flex-wrap">
                          {colorOptions.map((color, index) => (
                            <button
                              key={index}
                              onClick={() => setEditNote({ ...editNote, color })}
                              className={`w-6 h-6 rounded-full bg-gradient-to-r ${color} transition-all duration-200 ${
                                editNote.color === color ? 'ring-2 ring-white/70 scale-110' : 'hover:scale-110'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <input
                        type="text"
                        value={editNote.title}
                        onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 mb-4 font-bold text-lg focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
                      />
                      <textarea
                        value={editNote.content}
                        onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                        rows="6"
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 mb-4 focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none transition-all duration-300"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleEditSave}
                          className="flex items-center gap-2 bg-green-500/80 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105"
                        >
                          <Save size={14} />
                          Save
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="flex items-center gap-2 bg-gray-500/80 hover:bg-gray-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="p-6 backdrop-blur-lg bg-black/20">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-white line-clamp-2 flex-1 mr-3">
                            {note.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleFavorite(note.id)}
                              className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                                note.isFavorite 
                                  ? 'bg-yellow-500/30 text-yellow-300' 
                                  : 'bg-white/10 text-white/60 hover:bg-white/20'
                              }`}
                            >
                              <Star size={16} className={note.isFavorite ? 'fill-current' : ''} />
                            </button>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={() => handleShare(note)}
                                className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-white rounded-lg transition-all duration-200 transform hover:scale-110 backdrop-blur-sm"
                                title="Share"
                              >
                                <Share2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDuplicate(note)}
                                className="p-2 bg-green-500/20 hover:bg-green-500/40 text-white rounded-lg transition-all duration-200 transform hover:scale-110 backdrop-blur-sm"
                                title="Duplicate"
                              >
                                <Copy size={14} />
                              </button>
                              <button
                                onClick={() => handleExport(note)}
                                className="p-2 bg-purple-500/20 hover:bg-purple-500/40 text-white rounded-lg transition-all duration-200 transform hover:scale-110 backdrop-blur-sm"
                                title="Export"
                              >
                                <Download size={14} />
                              </button>
                              <button
                                onClick={() => handleEditStart(note)}
                                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 transform hover:scale-110 backdrop-blur-sm"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(note.id)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/40 text-white rounded-lg transition-all duration-200 transform hover:scale-110 backdrop-blur-sm"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-white/90 mb-6 line-clamp-4 leading-relaxed">
                          {note.content}
                        </p>
                      </div>
                      <div className="px-6 py-4 backdrop-blur-lg bg-black/30 border-t border-white/20">
                        <div className="flex items-center gap-2 text-white/70">
                          <Clock size={14} />
                          <p className="text-sm font-medium">
                            {formatDate(note.createdAt)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Share Modal */}
        {showShareModal && shareNote && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Share2 className="text-purple-300" size={24} />
                  <h3 className="text-xl font-bold text-white">Share Note</h3>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={() => handleWebShare(shareNote)}
                    className="w-full flex items-center gap-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl text-white transition-all duration-200"
                  >
                    <Share2 size={20} />
                    <span>Share via system dialog</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const shareText = `${shareNote.title}\n\n${shareNote.content}`;
                      handleCopyToClipboard(shareText);
                      setShowShareModal(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 bg-green-500/20 hover:bg-green-500/30 rounded-xl text-white transition-all duration-200"
                  >
                    <Copy size={20} />
                    <span>Copy to clipboard</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleExport(shareNote);
                      setShowShareModal(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-white transition-all duration-200"
                  >
                    <Download size={20} />
                    <span>Export as text file</span>
                  </button>
                </div>
                
                <div className="mt-6 pt-4 border-t border-white/20">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="w-full p-3 bg-gray-500/20 hover:bg-gray-500/30 rounded-xl text-white transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 backdrop-blur-lg bg-white/10 border border-white/20 rounded-full px-6 py-3">
            <Sparkles className="text-purple-300" size={16} />
            <p className="text-purple-200 font-medium">
              {notes.length} {notes.length === 1 ? 'brilliant note' : 'brilliant notes'}
              {notes.filter(n => n.isFavorite).length > 0 && ` • ${notes.filter(n => n.isFavorite).length} favorites`}
              {searchTerm && ` • ${filteredNotes.length} matching your search`}
              <span className="text-purple-300 ml-2">• Auto-saved ✨</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}