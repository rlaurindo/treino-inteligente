import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, Share2, Award, Trophy, Users, Send, Sparkles, MessageCircle, Flame 
} from 'lucide-react';
import { Achievement, UserProfile } from '../types';
import { createAchievement, loadAchievements, updateAchievementLikes } from '../services/db';

interface CommunityFeedProps {
  user: UserProfile;
  darkMode: boolean;
}

export default function CommunityFeed({ user, darkMode }: CommunityFeedProps) {
  const [feedItems, setFeedItems] = useState<Achievement[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      try {
        const dbPosts = await loadAchievements();
        if (dbPosts && dbPosts.length > 0) {
          setFeedItems(dbPosts.sort((a, b) => b.id.localeCompare(a.id)));
        } else {
          setFeedItems([]);
        }
      } catch (err) {
        console.error('Error fetching achievements:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const handleLike = (id: string) => {
    setFeedItems(prev => prev.map(item => {
      if (item.id === id) {
        const liked = !item.likedByUser;
        const nextLikes = liked ? item.likes + 1 : item.likes - 1;
        updateAchievementLikes(id, nextLikes, liked).catch(console.error);
        return {
          ...item,
          likedByUser: liked,
          likes: nextLikes
        };
      }
      return item;
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: Achievement = {
      id: `ach-${Date.now()}`,
      userName: user.name,
      userAvatar: user.avatar,
      type: 'workout_completed',
      title: 'Log de Atividade Compartilhado',
      description: newPostText,
      timestamp: 'Agora mesmo',
      likes: 0,
      likedByUser: false
    };

    setFeedItems([newPost, ...feedItems]);
    setNewPostText('');
    createAchievement(newPost).catch(console.error);
  };

  return (
    <div className="space-y-6" id="community-container">
      {/* Community Summary statistics header */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${
        darkMode ? 'bg-brand-card border-brand-border text-stone-100' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${
            darkMode ? 'bg-brand-neon/10 text-brand-neon' : 'bg-emerald-500/10 text-emerald-500'
          }`}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-tight">Comunidade Ativa</h4>
            <span className={`text-[10px] font-bold block ${
              darkMode ? 'text-brand-neon' : 'text-emerald-500'
            }`}>1.242 membros online hoje</span>
          </div>
        </div>
        <div className="flex -space-x-2">
          {feedItems.map((item, idx) => (
            <img 
              key={idx} 
              src={item.userAvatar} 
              alt="Membro" 
              className={`w-7 h-7 rounded-full border object-cover ${
                darkMode ? 'border-zinc-950' : 'border-white'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Write Post Box */}
      <div className={`p-5 rounded-xl border ${
        darkMode ? 'bg-brand-card border-brand-border' : 'bg-white border-stone-200'
      }`}>
        <h3 className="font-bold text-xs uppercase tracking-widest text-stone-400 mb-3 block">Compartilhar com o Feed</h3>
        <form onSubmit={handleCreatePost} className="space-y-3">
          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Qual foi a conquista de hoje no treino? Compartilhe peso levantado ou metas atingidas!"
            rows={2}
            className={`w-full p-4 rounded-lg text-xs border focus:outline-none resize-opacity resize-none transition-all ${
              darkMode 
                ? 'bg-[#181818] border-brand-border-muted text-stone-100 placeholder-zinc-500 focus:ring-1 focus:ring-brand-neon/30' 
                : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500/30'
            }`}
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
              <Sparkles className={`w-3.5 h-3.5 ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`} />
              Sua publicação motivará a comunidade!
            </span>
            <button
              type="submit"
              className={`py-2.5 px-4 font-bold rounded-lg text-xs shadow-md flex items-center gap-2 transition-all uppercase tracking-tight ${
                darkMode 
                  ? 'bg-brand-neon text-black hover:bg-white shadow-brand-neon/10 font-extrabold' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
              }`}
            >
              <Send className="w-3 h-3" />
              Publicar
            </button>
          </div>
        </form>
      </div>

      {/* Feed Posts */}
      <div className="space-y-4">
        {feedItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-xl border ${
              darkMode ? 'bg-brand-card border-brand-border text-stone-100' : 'bg-white border-stone-200 text-stone-900'
            }`}
          >
            {/* User Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={item.userAvatar} 
                  alt={item.userName} 
                  className={`w-10 h-10 rounded-full border object-cover ${
                    darkMode ? 'border-brand-border-muted' : 'border-stone-100'
                  }`} 
                />
                <div>
                  <h4 className="font-bold text-sm tracking-tight">{item.userName}</h4>
                  <span className="text-[10px] text-stone-400 font-semibold">{item.timestamp}</span>
                </div>
              </div>

              {/* Badges based on type */}
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-extrabold uppercase tracking-wide ${
                darkMode 
                  ? 'bg-brand-neon/10 text-brand-neon border-brand-neon/20' 
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'
              }`}>
                {item.type === 'streak' ? (
                  <>
                    <Flame className="w-3 h-3" />
                    consistência
                  </>
                ) : item.type === 'heavy_lift' ? (
                  <>
                    <Trophy className={`w-3 h-3 ${darkMode ? 'text-brand-neon' : 'text-amber-500'}`} />
                    peso recorde
                  </>
                ) : (
                  <>
                    <Award className="w-3 h-3" />
                    treino feito
                  </>
                )}
              </div>
            </div>

            {/* Achievement Text */}
            <div className={`my-3.5 pl-2.5 border-l-2 ${
              darkMode ? 'border-brand-neon/60' : 'border-emerald-500/50'
            }`}>
              <h5 className={`text-xs font-black uppercase tracking-tight ${darkMode ? 'text-brand-neon' : 'text-emerald-500'}`}>{item.title}</h5>
              <p className="text-xs text-stone-300 leading-relaxed mt-1">{item.description}</p>
            </div>

            {/* Interactive Likes Toolbar */}
            <div className={`flex items-center gap-4 pt-2 border-t text-[11px] font-semibold text-stone-400 ${
              darkMode ? 'border-brand-border-muted' : 'border-stone-100'
            }`}>
              <button 
                onClick={() => handleLike(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#181818] transition-all ${
                  item.likedByUser ? 'text-rose-500 font-extrabold' : ''
                }`}
              >
                <Heart className={`w-4 h-4 ${item.likedByUser ? 'fill-rose-500 stroke-rose-400' : ''}`} />
                {item.likes} Curtidas
              </button>

              <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#181818] transition-all`}>
                <MessageCircle className="w-4 h-4" />
                Comentários
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
