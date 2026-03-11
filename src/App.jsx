import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Check, Plus, Flame, X, Calendar, Settings, Cloud, CloudOff,
  Download, Upload, Palette, ArrowRight, CalendarDays, Inbox,
  ChevronLeft, ChevronRight, BarChart2, GripVertical, MinusCircle,
  CheckCircle2, TrendingUp, ChevronUp, ChevronDown, Pencil, RotateCcw,
  User, Trophy, Medal, Award, Crown, Star, Link, Trash2, LogOut, Bell, Trash, Smartphone, Folder,
  Volume2, VolumeX, Pin, AlignLeft, Filter, Repeat, Activity,
  
  // Iconos - Productividad
  Target, Zap, Briefcase, CalendarClock, ListTodo, Focus, CheckSquare, ClipboardList, Clock, BarChart, TrendingUp as TrendingUpIcon, Flag, Lightbulb, Puzzle, Rocket, PlayCircle,
  // Iconos - Salud & Fitness
  Dumbbell, Heart, Droplet, Apple, Flame as FlameIcon, Bike, Thermometer, Carrot, Bone, Pill, HeartPulse, Timer, Footprints, Salad,
  // Iconos - Estudio & Trabajo
  Book, GraduationCap, Laptop, Code, PenTool, Calculator, BookOpen, Library, Microscope, Monitor, FileText, PencilRuler, Highlighter, Folder as FolderIcon, Archive, Paperclip,
  // Iconos - Hogar & Vida
  Building, Car, ShoppingCart, Utensils, BedDouble, Wrench, Home, Hammer, Scissors, Key, Bath, Armchair, Refrigerator, Lock, Package, Brush,
  // Iconos - Bienestar
  Smile, Moon, Sun, Coffee, Leaf, Music, Cloud as CloudIcon, Wind, Sunrise, Sunset, Rainbow, Umbrella, Headphones, Flower2, HeartHandshake, Palmtree,
  // Iconos - Ocio
  Gamepad, Tv, Camera, Plane, Globe, Ticket, Clapperboard, Film, Popcorn, Image as ImageIcon, Map, MapPin, Compass, Tent, PartyPopper
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  enableIndexedDbPersistence,
  increment,
  deleteField,
  getDocs,
  query
} from 'firebase/firestore';

// --- CONFIGURACIÓN PWA Y VIEWPORT ---
if (typeof document !== 'undefined') {
  let metaViewport = document.querySelector('meta[name="viewport"]');
  if (!metaViewport) {
    metaViewport = document.createElement('meta');
    metaViewport.name = 'viewport';
    document.head.appendChild(metaViewport);
  }
  metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

  const manifest = {
    name: "Goood.",
    short_name: "Goood",
    description: "Construye hábitos y alcanza tus metas diarias.",
    start_url: ".",
    display: "standalone",
    background_color: "#F2F2F7",
    theme_color: "#007AFF",
    icons: [{
      src: "https://cdn-icons-png.flaticon.com/512/753/753317.png",
      sizes: "192x192",
      type: "image/png"
    }]
  };
  const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  const manifestUrl = URL.createObjectURL(manifestBlob);
  let linkManifest = document.querySelector('link[rel="manifest"]');
  if(!linkManifest) {
    linkManifest = document.createElement('link');
    linkManifest.rel = 'manifest';
    document.head.appendChild(linkManifest);
  }
  linkManifest.href = manifestUrl;
}

// --- CONFIGURACIÓN DE FIREBASE ---
const userConfig = {
  apiKey: 'AIzaSyBYlUkLh30GAzY81KUTKFCDWwo-4A6bHoA',
  authDomain: 'goood-app.firebaseapp.com',
  projectId: 'goood-app',
  storageBucket: 'goood-app.firebasestorage.app',
  messagingSenderId: '427853842494',
  appId: '1:427853842494:web:7091660bfdc0b31fdb296f',
};

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : userConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'goood-oficial';

try {
  enableIndexedDbPersistence(db).catch(() => {});
} catch (e) {}

// Paleta de colores
const HABIT_COLORS = [
  'bg-blue-300', 'bg-indigo-300', 'bg-violet-300', 'bg-purple-300', 'bg-fuchsia-300',
  'bg-pink-300', 'bg-rose-300', 'bg-red-300', 'bg-orange-300', 'bg-yellow-300',
  'bg-lime-300', 'bg-green-300', 'bg-emerald-300', 'bg-teal-300', 'bg-cyan-300',
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
  'bg-pink-500', 'bg-rose-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-400',
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
];

const ICON_CATEGORIES = {
  "Productividad": { Target, Zap, Briefcase, CalendarClock, ListTodo, Focus, CheckSquare, ClipboardList, Clock, BarChart, TrendingUpIcon, Flag, Lightbulb, Puzzle, Rocket, PlayCircle },
  "Salud & Fitness": { Dumbbell, Heart, Droplet, Apple, FlameIcon, Bike, Thermometer, Carrot, Bone, Pill, HeartPulse, Timer, Footprints, Salad, Medal },
  "Estudio & Trabajo": { Book, GraduationCap, Laptop, Code, PenTool, Calculator, BookOpen, Library, Microscope, Monitor, FileText, PencilRuler, Highlighter, FolderIcon, Archive, Paperclip },
  "Hogar & Vida": { Building, Car, ShoppingCart, Utensils, BedDouble, Wrench, Home, Hammer, Scissors, Key, Bath, Armchair, Refrigerator, Lock, Package, Brush },
  "Bienestar": { Smile, Moon, Sun, Coffee, Leaf, Music, CloudIcon, Wind, Sunrise, Sunset, Rainbow, Umbrella, Headphones, Flower2, HeartHandshake, Palmtree },
  "Ocio": { Gamepad, Tv, Camera, Plane, Globe, Ticket, Clapperboard, Film, Popcorn, ImageIcon, Map, MapPin, Compass, Tent, PartyPopper }
};
const ICON_MAP = Object.values(ICON_CATEGORIES).reduce((acc, category) => ({ ...acc, ...category }), {});

const DAYS_OF_WEEK = [
  { id: 1, label: 'L' }, { id: 2, label: 'M' }, { id: 3, label: 'X' }, 
  { id: 4, label: 'J' }, { id: 5, label: 'V' }, { id: 6, label: 'S' }, { id: 0, label: 'D' }
];

// --- CONTENIDO DEL TUTORIAL ---
const TUTORIAL_STEPS = [
  {
    icon: Target,
    title: "Domina tu rutina",
    desc: "Crea metas para un día específico o prográmalas para un rango de días. Construye hábitos sólidos paso a paso.",
    color: "text-[#007AFF]", bg: "bg-[#007AFF]/10"
  },
  {
    icon: TrendingUpIcon,
    title: "Sube de Nivel",
    desc: "Cada meta completada te otorga +10 XP. Acumula experiencia, sube de nivel y alcanza nuevos rangos de disciplina.",
    color: "text-purple-500", bg: "bg-purple-100"
  },
  {
    icon: Crown,
    title: "Días Perfectos",
    desc: "Si completas absolutamente todas tus metas del día, recibirás un trofeo y un bono especial de +25 XP.",
    color: "text-orange-500", bg: "bg-orange-100"
  },
  {
    icon: RotateCcw,
    title: "A prueba de errores",
    desc: "¿Te equivocaste? Deshaz acciones al instante. Además, las metas eliminadas van a la papelera por 48h para que no pierdas nada.",
    color: "text-green-500", bg: "bg-green-100"
  },
  {
    icon: Smartphone,
    title: "Siempre Contigo",
    desc: "Instala la app: Toca 'Compartir' en Safari o Chrome y selecciona 'Agregar a inicio' para tener Goood como una app nativa.",
    color: "text-gray-800", bg: "bg-gray-200"
  }
];

// Helper functions 
function getFormatDateStr(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const todayStr = getFormatDateStr(new Date());

function getDatesInRange(startStr, endStr) {
  const dates = [];
  let current = new Date(startStr + 'T12:00:00');
  const last = new Date(endStr + 'T12:00:00');
  let limit = 90;
  while (current <= last && limit > 0) {
    dates.push(getFormatDateStr(current));
    current.setDate(current.getDate() + 1);
    limit--;
  }
  return dates;
}

function getLevelInfo(totalXp) {
  let level = 1;
  let xpForNext = 100;
  let remainingXp = Math.max(0, totalXp || 0);

  while (remainingXp >= xpForNext) {
    remainingXp -= xpForNext;
    level++;
    xpForNext = level * 100;
  }

  let rank = "Estándar";
  if (level >= 6 && level <= 10) rank = "Novato";
  else if (level >= 11 && level <= 20) rank = "Constante";
  else if (level >= 21 && level <= 35) rank = "Disciplinado";
  else if (level >= 36 && level <= 50) rank = "Avanzado";
  else if (level >= 51 && level <= 75) rank = "Experto";
  else if (level >= 76 && level <= 100) rank = "Maestro";
  else if (level >= 101) rank = "Legendario";

  return { level, rank, currentLevelXp: remainingXp, xpForNextLevel: xpForNext, progress: Math.round((remainingXp / xpForNext) * 100) };
}

// --- COMPONENTE CONFETI ---
const ConfettiOverlay = () => {
  const pieces = useMemo(() => Array.from({length: 70}).map((_, i) => ({
      left: Math.random() * 100 + 'vw',
      backgroundColor: ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#FFCC00'][Math.floor(Math.random()*6)],
      animationDelay: Math.random() * 2 + 's',
      animationDuration: Math.random() * 2 + 2 + 's',
      width: Math.random() * 8 + 6 + 'px',
      height: Math.random() * 8 + 6 + 'px',
      borderRadius: Math.random() > 0.5 ? '50%' : '2px'
  })), []);
  
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {pieces.map((s,i) => <div key={i} className="confetti-piece" style={s} />)}
    </div>
  );
};

// --- COMPONENTE TARJETA DE CATEGORÍA (PILA) ---
const CategoryCard = ({ group, habitStreaks, isPendingMode, isEditing, onToggle, onDelete, onEdit, onMoveToToday, onMove, onDragStart, onDragEnd, onDragOver, onDrop, onDeleteGroup, onAddInsideCategory, onEditGroup, onTogglePin, isPinned }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const total = group.habits.length;
  const completed = group.habits.filter(h => h.completed).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  const isAllDone = total > 0 && completed === total;

  const expanded = isExpanded || isEditing;
  const IconComponent = group.icon ? (ICON_MAP[group.icon] || Folder) : Folder;

  const sortedHabits = [...group.habits].sort((a,b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.order - b.order;
  });

  return (
    <div className={`bg-white rounded-[24px] shadow-sm border transition-all duration-400 ease-out overflow-hidden ${isAllDone && !isEditing ? 'border-[#34C759]/30 bg-[#34C759]/5' : 'border-black/[0.04]'}`}>
      <div onClick={() => setIsExpanded(!expanded)} className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors relative z-10">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className={`relative w-10 h-10 rounded-[14px] flex items-center justify-center text-white shadow-sm transition-all duration-500 ${isAllDone ? 'bg-[#34C759] scale-105' : group.color} ${isPendingMode ? 'opacity-50 grayscale' : ''}`}>
               {isAllDone ? <CheckCircle2 size={20} strokeWidth={2.5} /> : <IconComponent size={20} strokeWidth={2.2} />}
               {isPinned && !isAllDone && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                      <Pin size={8} fill="currentColor" />
                  </div>
               )}
            </div>
            <div>
               <h3 className={`font-extrabold text-[15px] tracking-tight uppercase transition-colors duration-300 ${isAllDone && !isEditing ? 'text-[#34C759]' : 'text-gray-900'}`}>
                 {group.name}
               </h3>
               <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                 {total > 0 ? `${completed} de ${total} completadas` : 'Categoría vacía'}
               </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
             {!isEditing && !isPendingMode && (
                <button
                   onClick={(e) => {
                      e.stopPropagation();
                      onAddInsideCategory(group.name);
                   }}
                   className="w-7 h-7 flex items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 hover:scale-105 active:scale-95 transition-all"
                   title="Añadir meta a esta categoría"
                >
                   <Plus size={14} strokeWidth={3}/>
                </button>
             )}
             {isEditing && !isPendingMode && (
                <>
                  <button
                     onClick={(e) => { e.stopPropagation(); onTogglePin(group.name); }}
                     className={`w-7 h-7 flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all ${isPinned ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                     <Pin size={12} strokeWidth={2.5} fill={isPinned ? 'currentColor' : 'none'}/>
                  </button>
                  <button
                     onClick={(e) => { e.stopPropagation(); onEditGroup(group); }}
                     className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 text-[#007AFF] hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all"
                  >
                     <Pencil size={12} strokeWidth={2.5}/>
                  </button>
                  <button
                     onClick={(e) => { e.stopPropagation(); onDeleteGroup(group); }}
                     className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:scale-105 active:scale-95 transition-all"
                  >
                     <Trash2 size={12} strokeWidth={2.5}/>
                  </button>
                </>
             )}
             <div className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 ${expanded ? 'bg-gray-200 rotate-180' : 'bg-gray-100'}`}>
                <ChevronDown size={14} className="text-gray-500" strokeWidth={2.5}/>
             </div>
          </div>
        </div>
        
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
           <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isAllDone ? 'bg-[#34C759]' : 'bg-[#007AFF]'}`} style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className={`transition-all duration-500 ease-in-out ${expanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'} bg-gray-50/30`}>
        <div className="px-2 pb-2 flex flex-col gap-1.5">
           {sortedHabits.map(habit => (
             <div key={habit.id} className="relative">
                <div className="absolute left-[16px] top-[-8px] bottom-4 w-[2px] bg-gray-200/60 -z-10 rounded-full hidden sm:block"></div>
                <div className="relative z-10 sm:pl-2">
                   <HabitCard
                     habit={habit} computedStreak={habitStreaks[habit.id] || 0} isPendingMode={isPendingMode} isEditing={isEditing}
                     onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} onMoveToToday={onMoveToToday}
                     onMove={onMove} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver} onDrop={onDrop}
                     hideIcon={true}
                   />
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE TARJETA DE HÁBITO ---
const HabitCard = ({
  habit, computedStreak, isPendingMode, isEditing, onToggle, onDelete, onEdit, onMoveToToday, onMove, onDragStart, onDragEnd, onDragOver, onDrop, hideIcon = false
}) => {
  const IconComponent = ICON_MAP[habit.icon] || Target;

  return (
    <div
      draggable={isEditing && !isPendingMode && !habit.completed}
      onDragStart={(e) => onDragStart(e, habit.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, habit.id)}
      onClick={() => !isPendingMode && onToggle(habit.id)}
      className={`group flex flex-col p-3 md:p-4 bg-white rounded-[20px] transition-all duration-400 ease-out ${
        isEditing && !isPendingMode && !habit.completed ? 'cursor-grab active:cursor-grabbing hover:bg-gray-50 border-gray-200' : ''
      } ${!isEditing && !isPendingMode ? 'cursor-pointer active:scale-[0.98]' : ''} ${
        habit.completed && !isEditing
          ? 'opacity-60 grayscale-[0.3] scale-[0.99] border border-black/[0.02]'
          : 'shadow-sm border border-black/[0.04] hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {isEditing && !isPendingMode && (
            <div className="flex items-center gap-1 flex-shrink-0 mr-1">
              <button onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }} className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors p-1.5" title="Eliminar">
                <MinusCircle size={18} className="fill-red-100" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onEdit(habit); }} className="text-[#007AFF] hover:text-[#006ae6] hover:bg-blue-50 rounded-full transition-colors p-1.5" title="Editar">
                <Pencil size={16} className="fill-blue-100" />
              </button>
            </div>
          )}

          {!hideIcon ? (
            <div className={`flex-shrink-0 w-10 h-10 rounded-[14px] flex items-center justify-center text-white ${habit.color} ${isPendingMode ? 'opacity-50 grayscale' : ''}`}>
              <IconComponent size={20} strokeWidth={2.2} />
            </div>
          ) : (
            <div className={`w-2.5 h-2.5 rounded-full ${habit.color} flex-shrink-0 mx-1 shadow-sm`}></div>
          )}
          
          <div className="min-w-0 flex-1 pr-2">
            <h3 className={`font-semibold text-[15px] md:text-[16px] tracking-tight truncate transition-colors duration-300 ${habit.completed && !isEditing ? 'text-gray-400 line-through decoration-2' : 'text-gray-900'}`} title={habit.name}>
              {habit.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              {isPendingMode ? (
                <span className="text-[11px] font-medium text-red-400 truncate tracking-wide">De otro día</span>
              ) : (
                <>
                  <Flame size={12} className={computedStreak > 0 ? 'text-orange-500 flex-shrink-0' : 'text-gray-300 flex-shrink-0'} strokeWidth={2.5} />
                  <span className={`text-[11px] font-medium truncate tracking-wide ${computedStreak > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                    {computedStreak} {computedStreak === 1 ? 'día' : 'días'} racha
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {isPendingMode ? (
          <button onClick={() => onMoveToToday(habit.id)} className="flex-shrink-0 ml-1 px-3 py-1.5 bg-[#007AFF] text-white text-[11px] font-bold rounded-full flex items-center gap-1 hover:bg-[#006ae6] transition-all active:scale-95">
            <span className="hidden sm:inline">Añadir</span> <ArrowRight size={14} />
          </button>
        ) : isEditing && !habit.completed ? (
          <div className="flex items-center gap-1 flex-shrink-0 ml-1">
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-0.5 border border-gray-100 shadow-sm">
              <button onClick={(e) => { e.stopPropagation(); onMove(habit.id, 'up'); }} className="text-gray-400 hover:text-black active:scale-90 p-0.5">
                <ChevronUp size={16} strokeWidth={3} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onMove(habit.id, 'down'); }} className="text-gray-400 hover:text-black active:scale-90 p-0.5">
                <ChevronDown size={16} strokeWidth={3} />
              </button>
            </div>
            <div className="hidden sm:flex items-center justify-center text-gray-300 cursor-grab active:cursor-grabbing px-1">
              <GripVertical size={20} />
            </div>
          </div>
        ) : (
          <div className={`flex-shrink-0 ml-1 w-7 h-7 rounded-full border-[2px] flex items-center justify-center transition-all duration-500 ease-out ${habit.completed ? 'bg-[#34C759] border-[#34C759] text-white scale-110' : 'border-gray-200 text-transparent group-hover:border-gray-300 group-hover:scale-105'}`}>
            <Check size={14} strokeWidth={3.5} />
          </div>
        )}
      </div>

      {habit.notes && !isEditing && (
        <div className={`mt-2 mb-0.5 pl-[48px] pr-2 transition-all ${hideIcon ? 'pl-6' : ''}`}>
           <div className={`px-2.5 py-2 rounded-[12px] text-[11px] md:text-[12px] leading-snug whitespace-pre-wrap flex gap-1.5 ${habit.completed ? 'bg-gray-50 text-gray-400' : 'bg-blue-50/50 text-gray-600 border border-blue-100/50'}`}>
              <AlignLeft size={12} className="flex-shrink-0 mt-[2px] opacity-50" />
              <span>{habit.notes}</span>
           </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('goood_sound') !== 'false');
  
  useEffect(() => localStorage.setItem('goood_sound', soundEnabled), [soundEnabled]);

  const [todayStrLocal, setTodayStrLocal] = useState(getFormatDateStr(new Date()));
  useEffect(() => {
    const interval = setInterval(() => {
        const currentDayStr = getFormatDateStr(new Date());
        if (currentDayStr !== todayStrLocal) {
            setTodayStrLocal(currentDayStr);
            setSelectedDateStr(currentDayStr); 
        }
    }, 60000); 
    return () => clearInterval(interval);
  }, [todayStrLocal]);

  const [userProfile, setUserProfile] = useState(null);
  const [tempFName, setTempFName] = useState('');
  const [tempLName, setTempLName] = useState('');
  const [xpLogs, setXpLogs] = useState([]);
  
  const [allRawHabits, setAllRawHabits] = useState([]); 
  const [selectedDateStr, setSelectedDateStr] = useState(todayStrLocal);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isXpHistoryOpen, setIsXpHistoryOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [syncStatus, setSyncStatus] = useState('connecting');
  const [draggedHabitId, setDraggedHabitId] = useState(null);

  const [filterMode, setFilterMode] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [modalMode, setModalMode] = useState('single');
  const [categoryInput, setCategoryInput] = useState('');
  const [bulkItems, setBulkItems] = useState(['', '', '']);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEditStr, setCategoryToEditStr] = useState('');
  const [editCatName, setEditCatName] = useState('');
  const [editCatColor, setEditCatColor] = useState(HABIT_COLORS[0]);
  const [editCatIcon, setEditCatIcon] = useState('Target');
  const [editCatIconCategory, setEditCatIconCategory] = useState(Object.keys(ICON_CATEGORIES)[0]);

  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const [slideDirection, setSlideDirection] = useState('none');
  const [calendarKey, setCalendarKey] = useState(0);

  const [habitToEdit, setHabitToEdit] = useState(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitNotes, setNewHabitNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [selectedIconCategory, setSelectedIconCategory] = useState(Object.keys(ICON_CATEGORIES)[0]);
  const [selectedIcon, setSelectedIcon] = useState('Target');
  
  const [scheduleMode, setScheduleMode] = useState('single');
  const [rangeEndDate, setRangeEndDate] = useState(todayStrLocal);
  const [recurringDays, setRecurringDays] = useState([1,2,3,4,5]); 

  const [progressView, setProgressView] = useState('daily');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [deletePrompt, setDeletePrompt] = useState({ visible: false, habit: null, related: [] });
  const [toast, setToast] = useState({ visible: false, message: '', onUndo: null });
  const [levelUpData, setLevelUpData] = useState({ visible: false, level: 0 });
  const [confirmModal, setConfirmModal] = useState({ visible: false, title: '', message: '', confirmText: 'Confirmar', isDestructive: false, onConfirm: () => {} });
  
  const toastTimeoutRef = useRef(null);
  const prevLevelRef = useRef(null);

  const fileInputRef = useRef(null);
  const completionSound = useRef(null);
  const allDoneSound = useRef(null);

  const habits = useMemo(() => allRawHabits.filter(h => !h.deletedAt), [allRawHabits]);
  const trashedHabits = useMemo(() => allRawHabits.filter(h => h.deletedAt).sort((a,b) => b.deletedAt - a.deletedAt), [allRawHabits]);

  const uniqueCategories = useMemo(() => {
     const derived = habits.filter(h => h.category).map(h => h.category);
     const custom = (userProfile?.customCategories || []).map(c => c.name);
     return [...new Set([...derived, ...custom])];
  }, [habits, userProfile?.customCategories]);

  const habitStreaks = useMemo(() => {
    const streaks = {};
    const habitsByName = {};
    
    habits.forEach(h => {
        if (!habitsByName[h.name]) habitsByName[h.name] = {};
        habitsByName[h.name][h.date] = h;
    });

    habits.forEach(h => {
        let currentStreak = 0;
        if (h.completed) {
            currentStreak = 1;
            let checkDate = new Date(h.date + 'T12:00:00');
            while (true) {
                checkDate.setDate(checkDate.getDate() - 1);
                const prevDateStr = getFormatDateStr(checkDate);
                const prevHabit = habitsByName[h.name]?.[prevDateStr];
                if (prevHabit && prevHabit.completed) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
        streaks[h.id] = currentStreak;
    });
    return streaks;
  }, [habits]);

  useEffect(() => {
    completionSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3');
    completionSound.current.volume = 0.4;
    allDoneSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    allDoneSound.current.volume = 0.5;
    if ('Notification' in window) setNotificationsEnabled(Notification.permission === 'granted');
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
    });

    const handleOnline = () => setSyncStatus('synced');
    const handleOffline = () => setSyncStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setSyncStatus(navigator.onLine ? 'synced' : 'offline');

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
    const unsub = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProfile(data);
          
          if (data.firstName && !localStorage.getItem(`tutorial_${user.uid}`)) {
              setShowTutorial(true);
          }
      }
      else setUserProfile({ xp: 0 }); 
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const logsRef = query(collection(db, 'artifacts', appId, 'users', user.uid, 'xp_logs'));
    const unsub = onSnapshot(logsRef, (snap) => {
       const logs = snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => b.ts - a.ts);
       setXpLogs(logs);
    });
    return () => unsub();
  }, [user]);

  const completeTutorial = () => {
     localStorage.setItem(`tutorial_${user.uid}`, 'true');
     setShowTutorial(false);
     setTutorialStep(0);
  };

  const openTutorialFromSettings = () => {
     setIsSettingsOpen(false);
     setTutorialStep(0);
     setShowTutorial(true);
  };

  useEffect(() => {
    if (!notificationsEnabled) return;
    const checkTime = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 20 && now.getMinutes() === 0 && now.getSeconds() < 10) {
         const uncompleted = habits.filter(h => h.date === todayStrLocal && !h.completed);
         if (uncompleted.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Goood. - Recordatorio', {
               body: `Te quedan ${uncompleted.length} metas por cumplir hoy. ¡Aún hay tiempo!`,
               icon: 'https://cdn-icons-png.flaticon.com/512/753/753317.png'
            });
         }
      }
    }, 10000);
    return () => clearInterval(checkTime);
  }, [habits, notificationsEnabled, todayStrLocal]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return alert('Tu navegador no soporta notificaciones.');
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    if (permission === 'granted') alert('Recordatorios activados. Recibirás un aviso a las 20:00 si tienes metas pendientes.');
  };

  useEffect(() => {
    if (!userProfile || userProfile.xp === undefined) return;
    const currentLevel = getLevelInfo(userProfile.xp).level;
    if (prevLevelRef.current === null) { prevLevelRef.current = currentLevel; return; }
    if (currentLevel > prevLevelRef.current) {
        setLevelUpData({ visible: true, level: currentLevel });
        setShowConfetti(true);
        if (soundEnabled && completionSound.current) {
            completionSound.current.currentTime = 0;
            completionSound.current.play().catch(e => console.log(e));
        }
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        setTimeout(() => { 
            setLevelUpData({ visible: false, level: 0 }); 
            setShowConfetti(false);
        }, 4500);
    }
    prevLevelRef.current = currentLevel;
  }, [userProfile?.xp, soundEnabled]);

  useEffect(() => {
    if (!user) return;
    const habitsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'habits');
    const unsubscribe = onSnapshot(habitsRef, (snapshot) => {
        const loaded = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date || todayStrLocal,
            completed: data.completedToday !== undefined ? data.completedToday : data.completed || false,
            order: data.order || 0,
            ...data,
          };
        });
        loaded.sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return (a.createdAt || 0) - (b.createdAt || 0);
        });
        setAllRawHabits(loaded);
      },
      (error) => console.error('Sync error:', error)
    );
    return () => unsubscribe();
  }, [user, todayStrLocal]);

  useEffect(() => {
     if (!user || trashedHabits.length === 0) return;
     const now = Date.now();
     const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
     const toDelete = trashedHabits.filter(h => now - h.deletedAt > TWO_DAYS_MS);
     
     if (toDelete.length > 0) {
         const batch = writeBatch(db);
         toDelete.forEach(h => {
             batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', h.id));
         });
         batch.commit().catch(e => console.error("Error auto-deleting", e));
     }
  }, [trashedHabits, user]);

  useEffect(() => {
    if (!user || !userProfile || allRawHabits.length === 0) return;
    
    const timer = setTimeout(() => {
       const activeHabits = allRawHabits.filter(h => !h.deletedAt && !h.isCategoryPlaceholder);
       const targetDates = [...new Set(activeHabits.map(h => h.date))].filter(d => d <= todayStrLocal);
       
       let xpCorrection = 0;
       let newBonuses = { ...(userProfile.bonuses || {}) };
       let logsBatch = [];
       let needsUpdate = false;
       let perfectDayAchievedToday = false;

       targetDates.forEach(date => {
           const dayHabits = activeHabits.filter(h => h.date === date);
           const isPerfect = dayHabits.length > 0 && dayHabits.every(h => h.completed);
           const hasBonus = !!userProfile.bonuses?.[date];

           if (isPerfect && !hasBonus) {
               xpCorrection += 25;
               newBonuses[date] = true;
               logsBatch.push({ type: 'set', id: 'bonus_' + date, data: { desc: `Día perfecto: ${date}`, xp: 25, ts: Date.now() } });
               needsUpdate = true;
               if (date === todayStrLocal) perfectDayAchievedToday = true;
           } else if (!isPerfect && hasBonus && date < todayStrLocal) {
               xpCorrection -= 25;
               delete newBonuses[date];
               logsBatch.push({ type: 'delete', id: 'bonus_' + date });
               needsUpdate = true;
           }
       });

       if (needsUpdate) {
           withSync(async () => {
               const batch = writeBatch(db);
               const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
               
               batch.set(profileRef, {
                   xp: increment(xpCorrection),
                   bonuses: newBonuses
               }, { merge: true });

               logsBatch.forEach(log => {
                   const logRef = doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', log.id);
                   if (log.type === 'set') batch.set(logRef, log.data);
                   if (log.type === 'delete') batch.delete(logRef);
               });

               await batch.commit();
           });
           
           if (xpCorrection > 0) {
               showToast(`¡Bono validado! +${xpCorrection} XP`);
               if (perfectDayAchievedToday) {
                   setShowConfetti(true);
                   if (soundEnabled && allDoneSound.current) allDoneSound.current.play().catch(e=>console.log(e));
                   setTimeout(() => setShowConfetti(false), 4500);
               }
           } else if (xpCorrection < 0) {
               showToast(`Día perfecto roto. ${xpCorrection} XP`);
           }
       }
    }, 1500); 

    return () => clearTimeout(timer);
  }, [allRawHabits, userProfile?.bonuses, todayStrLocal, user, soundEnabled]);

  const withSync = async (actionFn) => {
    if (!user) return;
    if (navigator.onLine && syncStatus !== 'offline') setSyncStatus('syncing');
    try {
      await actionFn(); 
      if (navigator.onLine) setTimeout(() => setSyncStatus('synced'), 800);
    } catch (error) { console.error('Error en operación:', error); }
  };

  const showToast = (message, onUndoAction) => {
    setToast({ visible: true, message, onUndo: onUndoAction });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4500); 
  };

  const showConfirm = (title, message, onConfirm, confirmText = 'Confirmar', isDestructive = false) => {
    setConfirmModal({
        visible: true, title, message, confirmText, isDestructive,
        onConfirm: () => {
            setConfirmModal(prev => ({ ...prev, visible: false }));
            onConfirm();
        }
    });
  };

  const toggleHabit = (id, skipToast = false) => {
    if (isEditing) return;
    const habitToToggle = habits.find((h) => h.id === id);
    if (!habitToToggle) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    const isNowCompleted = !habitToToggle.completed;
    const wasCompleted = habitToToggle.completed;

    if (isNowCompleted && !skipToast && soundEnabled && completionSound.current) {
      completionSound.current.currentTime = 0;
      completionSound.current.play().catch((e) => console.log('Audio silenciado:', e));
    }

    let currentStreakBeforeToggle = 0;
    let checkDate = new Date(habitToToggle.date + 'T12:00:00');
    while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const prevDateStr = getFormatDateStr(checkDate);
        const prevHabit = habits.find(h => h.name === habitToToggle.name && h.date === prevDateStr);
        if (prevHabit && prevHabit.completed) {
            currentStreakBeforeToggle++;
        } else {
            break;
        }
    }
    
    let newStreak = isNowCompleted ? currentStreakBeforeToggle + 1 : 0;
    let originalStreak = wasCompleted ? currentStreakBeforeToggle + 1 : 0;

    let xpToAdd = 0;
    let toastMsgs = [];
    let logAdditions = [];

    if (isNowCompleted) {
        xpToAdd += 10;
        toastMsgs.push('Meta completada +10 XP');
        logAdditions.push({ id: `habit_${id}_${habitToToggle.date}`, desc: `Meta: ${habitToToggle.name}`, xp: 10 });
        
        if (newStreak === 7) { 
            xpToAdd += 75; 
            toastMsgs.push('¡Semana de Racha! +75 XP'); 
            logAdditions.push({ id: `racha_7_${id}_${habitToToggle.date}`, desc: `Racha 7 días: ${habitToToggle.name}`, xp: 75 });
        } else if (newStreak === 30) { 
            xpToAdd += 300; 
            toastMsgs.push('¡Mes de Racha! +300 XP'); 
            logAdditions.push({ id: `racha_30_${id}_${habitToToggle.date}`, desc: `Racha 30 días: ${habitToToggle.name}`, xp: 300 });
        } else if (newStreak === 365) { 
            xpToAdd += 2000; 
            toastMsgs.push('¡Año de Racha! +2000 XP'); 
            logAdditions.push({ id: `racha_365_${id}_${habitToToggle.date}`, desc: `Racha 1 Año: ${habitToToggle.name}`, xp: 2000 });
        }
    } else {
        xpToAdd -= 10;
        if (originalStreak === 7) xpToAdd -= 75;
        if (originalStreak === 30) xpToAdd -= 300;
        if (originalStreak === 365) xpToAdd -= 2000;
    }
    
    withSync(async () => {
      const batch = writeBatch(db);
      batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', id), { completed: isNowCompleted }, { merge: true });
      
      if (xpToAdd !== 0) {
         batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), { xp: increment(xpToAdd) }, { merge: true });
      }

      if (isNowCompleted) {
         logAdditions.forEach(log => {
             batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', log.id), { desc: log.desc, xp: log.xp, ts: Date.now() });
         });
      } else {
         batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `habit_${id}_${habitToToggle.date}`));
         if (originalStreak === 7) batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `racha_7_${id}_${habitToToggle.date}`));
         if (originalStreak === 30) batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `racha_30_${id}_${habitToToggle.date}`));
         if (originalStreak === 365) batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `racha_365_${id}_${habitToToggle.date}`));
      }
      await batch.commit();
    });

    if (!skipToast) {
      const msg = isNowCompleted ? toastMsgs.join(' • ') : `Meta desmarcada. ${xpToAdd} XP`;
      showToast(msg, () => {
         withSync(async () => {
             const batch = writeBatch(db);
             batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', id), { completed: wasCompleted }, { merge: true });
             
             if (xpToAdd !== 0) {
                 batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), { xp: increment(-xpToAdd) }, { merge: true });
             }
             
             if (!wasCompleted) {
                 batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `habit_${id}_${habitToToggle.date}`)); 
                 if (newStreak === 7) batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `racha_7_${id}_${habitToToggle.date}`));
                 if (newStreak === 30) batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `racha_30_${id}_${habitToToggle.date}`));
                 if (newStreak === 365) batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `racha_365_${id}_${habitToToggle.date}`));
             } else {
                 batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `habit_${id}_${habitToToggle.date}`), { desc: `Meta: ${habitToToggle.name}`, xp: 10, ts: Date.now() });
                 if (originalStreak === 7) batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `racha_7_${id}_${habitToToggle.date}`), { desc: `Racha 7 días: ${habitToToggle.name}`, xp: 75, ts: Date.now() });
                 if (originalStreak === 30) batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `racha_30_${id}_${habitToToggle.date}`), { desc: `Racha 30 días: ${habitToToggle.name}`, xp: 300, ts: Date.now() });
                 if (originalStreak === 365) batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `racha_365_${id}_${habitToToggle.date}`), { desc: `Racha 1 Año: ${habitToToggle.name}`, xp: 2000, ts: Date.now() });
             }
             await batch.commit();
         });
         setToast(prev => ({ ...prev, visible: false }));
      });
    } else {
      setToast(prev => ({ ...prev, visible: false }));
    }
  };

  const executeTrash = (habitsToTrashArray) => {
    let xpLost = 0;
    habitsToTrashArray.forEach(h => { if (h.completed) xpLost += 10; });

    withSync(async () => {
      const batch = writeBatch(db);
      habitsToTrashArray.forEach(h => {
        batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', h.id), { deletedAt: Date.now() });
        if (h.completed) {
            batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `habit_${h.id}_${h.date}`));
        }
      });
      if (xpLost > 0) {
          batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), { xp: increment(-xpLost) }, { merge: true });
      }
      await batch.commit();
    });
    
    showToast(habitsToTrashArray.length > 1 ? `Metas a papelera (-${xpLost} XP)` : `Meta a papelera (-${xpLost} XP)`, () => {
      habitsToTrashArray.forEach(h => restoreFromTrash(h));
    });
  };

  const restoreFromTrash = (habit) => {
      let xpToAdd = 0;
      if (habit.completed) xpToAdd += 10;

      withSync(async () => {
          const batch = writeBatch(db);
          batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habit.id), { deletedAt: deleteField() });

          if (xpToAdd > 0) {
              batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), { xp: increment(xpToAdd) });
              batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'xp_logs', `habit_${habit.id}_${habit.date}`), { desc: `Recuperada: ${habit.name}`, xp: 10, ts: Date.now() });
          }
          await batch.commit();
      });
      showToast(habit.completed ? 'Meta restaurada (+10 XP)' : 'Meta restaurada');
  };

  const deleteHabit = (id) => {
    const habitToDelete = habits.find(h => h.id === id);
    if (!habitToDelete) return;
    const relatedHabits = habitToDelete.groupId ? habits.filter(h => h.groupId === habitToDelete.groupId) : [habitToDelete];
    if (relatedHabits.length > 1) {
       setDeletePrompt({ visible: true, habit: habitToDelete, related: relatedHabits });
    } else {
       executeTrash([habitToDelete]);
    }
  };

  const confirmDeleteMode = (mode) => {
    const { habit, related } = deletePrompt;
    const itemsToDelete = mode === 'all' ? related : [habit];
    executeTrash(itemsToDelete);
    setDeletePrompt({ visible: false, habit: null, related: [] });
  };

  const handleDeleteCategory = (group) => {
    const habitsToDelete = [...group.habits];
    if (group.placeholderId) {
         const placeholderHabit = habits.find(h => h.id === group.placeholderId);
         if (placeholderHabit) habitsToDelete.push(placeholderHabit);
    }
    
    showConfirm(
        "Eliminar Categoría",
        `¿Eliminar la categoría "${group.name}" y sus metas (${group.habits.length}) del día seleccionado?`,
        async () => {
           if (habitsToDelete.length > 0) {
               executeTrash(habitsToDelete);
           } else {
               showToast("Categoría eliminada");
           }
        },
        "Eliminar",
        true
    );
  };

  const toggleCategoryPin = (catName) => {
      const currentPins = userProfile?.pinnedCategories || [];
      const newPins = currentPins.includes(catName) ? currentPins.filter(c => c !== catName) : [...currentPins, catName];
      withSync(async () => {
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), { pinnedCategories: newPins }, { merge: true });
      });
  };

  const permanentDeleteFromTrash = (id) => {
      withSync(async () => await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', id)));
  };

  const emptyTrashNow = () => {
    if (trashedHabits.length === 0) return;
    showConfirm(
        "Vaciar Papelera",
        "¿Vaciar toda la papelera permanentemente? Esta acción no se puede deshacer.",
        () => {
            withSync(async () => {
                const batch = writeBatch(db);
                let count = 0;
                trashedHabits.forEach(h => {
                    if (count < 490) { 
                        batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', h.id));
                        count++;
                    }
                });
                await batch.commit();
            });
            showToast("Papelera vaciada por completo");
        },
        "Vaciar",
        true
    );
  };

  const clearAppCache = () => {
    showConfirm(
        "Limpiar Caché",
        "¿Seguro que deseas limpiar el caché local? Esto reiniciará la app y liberará espacio en tu dispositivo sin borrar tus metas en la nube.",
        () => {
           const tutFlag = localStorage.getItem(`tutorial_${user?.uid}`);
           const sndFlag = localStorage.getItem('goood_sound');
           localStorage.clear();
           if (tutFlag && user) localStorage.setItem(`tutorial_${user.uid}`, tutFlag);
           if (sndFlag) localStorage.setItem('goood_sound', sndFlag);
           window.location.reload(true);
        },
        "Limpiar y reiniciar",
        false
    );
  };

  const loginWithGoogle = async () => {
    setIsLoadingAuth(true);
    try {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoadingAuth(false);
    }
  };

  const loginAsGuest = async () => {
    setIsLoadingAuth(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Error:', error);
      setIsLoadingAuth(false);
    }
  };

  const linkGoogleAccount = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(auth.currentUser, provider);
      showToast('¡Cuenta de Google vinculada con éxito! Tus datos están a salvo.');
    } catch (error) {
      console.error('Error al vincular cuenta:', error);
      if (error.code === 'auth/credential-already-in-use') {
        showToast('Esta cuenta de Google ya está registrada. Inicia sesión directamente.');
      } else {
        showToast('Error al vincular: ' + error.message);
      }
    }
  };

  const deleteAccount = async () => {
    showConfirm(
        "Eliminar Cuenta",
        "¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Perderás todos tus datos y esta acción NO se puede deshacer.",
        async () => {
            setIsDeletingAccount(true);
            try {
              const habitsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'habits');
              const snap = await getDocs(habitsRef);
              const batch = writeBatch(db);
              snap.docs.forEach(docSnap => batch.delete(docSnap.ref));
              
              const logsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'xp_logs');
              const logsSnap = await getDocs(logsRef);
              logsSnap.docs.forEach(docSnap => batch.delete(docSnap.ref));

              batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'));
              await batch.commit();

              await auth.currentUser.delete();
            } catch (error) {
              console.error("Error eliminando cuenta", error);
              showToast('Debes cerrar sesión y volver a iniciarla para poder eliminar la cuenta por razones de seguridad.');
            } finally {
              setIsDeletingAccount(false);
            }
        },
        "Eliminar cuenta",
        true
    );
  };

  const saveProfileName = (e) => {
    e.preventDefault();
    if (!tempFName.trim() || !tempLName.trim()) return;
    setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), { 
      firstName: tempFName.trim(), 
      lastName: tempLName.trim(), 
      xp: userProfile?.xp || 0 
    }, { merge: true });
  };

  const rawCurrentGoals = useMemo(() => habits.filter((h) => h.date === selectedDateStr), [habits, selectedDateStr]);
  const rawPendingGoals = useMemo(() => habits.filter((h) => h.date < todayStrLocal && !h.completed), [habits, todayStrLocal]);

  const applyFilters = (list) => {
      let fList = list;
      if (filterMode === 'pending') fList = fList.filter(h => !h.completed && !h.isCategoryPlaceholder);
      if (filterMode === 'completed') fList = fList.filter(h => h.completed && !h.isCategoryPlaceholder);
      if (categoryFilter !== 'all') fList = fList.filter(h => h.category === categoryFilter);
      return fList;
  };

  const currentGoals = useMemo(() => applyFilters(rawCurrentGoals), [rawCurrentGoals, filterMode, categoryFilter]);
  const pendingGoals = useMemo(() => applyFilters(rawPendingGoals), [rawPendingGoals, filterMode, categoryFilter]);

  const groupHabits = (habitsList) => {
    const grouped = [];
    const categoryMap = {};

    const sortedList = [...habitsList].sort((a,b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return a.order - b.order;
    });

    sortedList.forEach(habit => {
        if (habit.category) {
            if (!categoryMap[habit.category]) {
                categoryMap[habit.category] = {
                    isCategoryGroup: true,
                    id: `cat_${habit.category}`,
                    name: habit.category,
                    habits: [],
                    order: habit.order,
                    color: habit.color,
                    icon: habit.icon
                };
                grouped.push(categoryMap[habit.category]);
            }
            
            if (habit.isCategoryPlaceholder) {
                categoryMap[habit.category].color = habit.color;
                categoryMap[habit.category].icon = habit.icon;
                categoryMap[habit.category].placeholderId = habit.id;
            } else {
                categoryMap[habit.category].habits.push(habit);
            }
        } else if (!habit.isCategoryPlaceholder) {
            grouped.push(habit);
        }
    });

    grouped.sort((a, b) => {
        const aPinned = userProfile?.pinnedCategories?.includes(a.name) ? 1 : 0;
        const bPinned = userProfile?.pinnedCategories?.includes(b.name) ? 1 : 0;
        if (aPinned !== bPinned) return bPinned - aPinned;
        return (a.order || 0) - (b.order || 0);
    });

    return grouped;
  };

  const groupedCurrentGoals = useMemo(() => groupHabits(currentGoals), [currentGoals, userProfile?.pinnedCategories]);
  const groupedPendingGoals = useMemo(() => groupHabits(pendingGoals), [pendingGoals, userProfile?.pinnedCategories]);

  const calendarDates = useMemo(() => {
    const dates = [];
    const baseDate = new Date(selectedDateStr + 'T12:00:00');
    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [selectedDateStr]);

  const shiftDate = (days) => {
    setSlideDirection(days > 0 ? 'right' : 'left');
    setCalendarKey(prev => prev + 1);
    const d = new Date(selectedDateStr + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDateStr(getFormatDateStr(d));
  };

  const openAddModal = () => {
    setHabitToEdit(null);
    setNewHabitName('');
    setNewHabitNotes('');
    setModalMode('single');
    setCategoryInput('');
    setBulkItems(['', '', '']);
    setSelectedColor(HABIT_COLORS[0]);
    setSelectedIcon('Target');
    setSelectedIconCategory(Object.keys(ICON_CATEGORIES)[0]);
    setScheduleMode('single');
    setRangeEndDate(selectedDateStr);
    setIsModalOpen(true);
  };

  const openAddModalForCategory = (catName) => {
    openAddModal();
    setCategoryInput(catName);
  };

  const openEditModal = (habit) => {
    setHabitToEdit(habit);
    setNewHabitName(habit.name);
    setNewHabitNotes(habit.notes || '');
    setCategoryInput(habit.category || '');
    setSelectedColor(habit.color);
    setSelectedIcon(habit.icon);
    const category = Object.keys(ICON_CATEGORIES).find(cat => Object.keys(ICON_CATEGORIES[cat]).includes(habit.icon));
    setSelectedIconCategory(category || Object.keys(ICON_CATEGORIES)[0]);
    setScheduleMode('single');
    setModalMode('single');
    setIsModalOpen(true);
  };

  const openEditCategoryModal = (group) => {
    setCategoryToEditStr(group.name);
    setEditCatName(group.name);
    setEditCatColor(group.color);
    setEditCatIcon(group.icon || 'Target');
    const catNode = Object.keys(ICON_CATEGORIES).find(c => Object.keys(ICON_CATEGORIES[c]).includes(group.icon));
    setEditCatIconCategory(catNode || Object.keys(ICON_CATEGORIES)[0]);
    setIsCategoryModalOpen(true);
  };

  const saveCategoryEdit = (e) => {
    e.preventDefault();
    if (!editCatName.trim()) return;

    withSync(async () => {
        const batch = writeBatch(db);
        const habitsInCat = allRawHabits.filter(h => h.category === categoryToEditStr);
        habitsInCat.forEach(h => {
            const habitRef = doc(db, 'artifacts', appId, 'users', user.uid, 'habits', h.id);
            batch.update(habitRef, {
                category: editCatName.trim(),
                color: editCatColor,
                icon: editCatIcon
            });
        });

        const currentPins = userProfile?.pinnedCategories || [];
        if (currentPins.includes(categoryToEditStr)) {
            const newPins = currentPins.map(p => p === categoryToEditStr ? editCatName.trim() : p);
            batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), { pinnedCategories: newPins }, { merge: true });
        }

        await batch.commit();
    });
    setIsCategoryModalOpen(false);
    showToast('Categoría actualizada exitosamente');
  };

  const saveHabit = (e) => {
    e.preventDefault();
    
    if (modalMode === 'category') {
        const newCatName = categoryInput.trim();
        if (!newCatName) return;

        const datesToCreate = scheduleMode === 'range' ? getDatesInRange(selectedDateStr, rangeEndDate) : [selectedDateStr];
        
        withSync(async () => {
            const batch = writeBatch(db);
            let count = 0;
            datesToCreate.forEach(dateStr => {
                const exists = habits.some(h => h.category === newCatName && h.date === dateStr && h.isCategoryPlaceholder);
                if (!exists) {
                    const newHabitRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'habits'));
                    batch.set(newHabitRef, {
                        id: newHabitRef.id,
                        isCategoryPlaceholder: true,
                        category: newCatName,
                        name: `[Cat] ${newCatName}`,
                        date: dateStr,
                        completed: false,
                        order: currentGoals.length + count,
                        color: selectedColor,
                        icon: selectedIcon,
                        createdAt: Date.now()
                    });
                    count++;
                }
            });
            await batch.commit();
            showToast(`Categoría "${newCatName}" creada`);
        });
        setIsModalOpen(false);
        return;
    }

    const catToSave = categoryInput.trim() ? categoryInput.trim() : null;
    let finalColor = selectedColor;
    let finalIcon = selectedIcon;

    if (catToSave) {
        const existingHabitInCat = habits.find(h => h.category === catToSave);
        if (existingHabitInCat) {
            finalColor = existingHabitInCat.color;
            finalIcon = existingHabitInCat.icon;
        }
    }

    if (habitToEdit) {
      if (!newHabitName.trim()) return;
      withSync(async () => {
        const habitRef = doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habitToEdit.id);
        await setDoc(habitRef, { name: newHabitName, color: finalColor, icon: finalIcon, category: catToSave, notes: newHabitNotes.trim() }, { merge: true });
      });
    } else {
      let namesToCreate = [];
      if (modalMode === 'bulk') {
         const items = bulkItems.map(s => s.trim()).filter(s => s.length > 0);
         if (items.length === 0) return;
         namesToCreate = items;
      } else {
         if (!newHabitName.trim()) return;
         namesToCreate = [newHabitName.trim()];
      }

      let datesToCreate = [];
      if (scheduleMode === 'single') {
          datesToCreate = [selectedDateStr];
      } else if (scheduleMode === 'range') {
          datesToCreate = getDatesInRange(selectedDateStr, rangeEndDate);
      } else if (scheduleMode === 'recurring') {
          let curr = new Date(selectedDateStr + 'T12:00:00');
          let limit = 56; 
          while(limit > 0) {
              if (recurringDays.includes(curr.getDay())) datesToCreate.push(getFormatDateStr(curr));
              curr.setDate(curr.getDate() + 1);
              limit--;
          }
      }

      const sharedGroupId = Date.now().toString() + Math.random().toString(36).substring(2, 8);
      
      withSync(async () => {
        const batch = writeBatch(db);
        let orderOffset = currentGoals.length;

        namesToCreate.forEach((name) => {
           datesToCreate.forEach((dateStr) => {
             const newHabitRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'habits'));
             batch.set(newHabitRef, {
               id: newHabitRef.id,
               groupId: sharedGroupId, 
               name: name,
               category: catToSave,
               notes: newHabitNotes.trim() || null,
               date: dateStr,
               completed: false,
               streak: 0,
               order: orderOffset,
               color: finalColor,
               icon: finalIcon,
               createdAt: Date.now(),
             });
             if (dateStr === selectedDateStr) orderOffset++;
           });
        });
        await batch.commit();
      });
    }
    setIsModalOpen(false);
  };

  const toggleRecurringDay = (dayId) => {
      if (recurringDays.includes(dayId)) {
          setRecurringDays(recurringDays.filter(d => d !== dayId));
      } else {
          setRecurringDays([...recurringDays, dayId]);
      }
  };

  const moveToToday = (id) => {
    const habitToMove = habits.find((h) => h.id === id);
    if (!habitToMove) return;
    withSync(async () => {
      const habitRef = doc(db, 'artifacts', appId, 'users', user.uid, 'habits', id);
      await setDoc(habitRef, { ...habitToMove, date: todayStrLocal }, { merge: true });
    });
  };

  const handleDragStart = (e, id) => {
    setDraggedHabitId(id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { e.target.style.opacity = '0.5'; }, 0);
  };
  const handleDragEnd = (e) => { e.target.style.opacity = '1'; setDraggedHabitId(null); };
  const handleDragOver = (e) => { e.preventDefault(); };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedHabitId || draggedHabitId === targetId) return;
    const draggedIndex = rawCurrentGoals.findIndex((h) => h.id === draggedHabitId);
    const targetIndex = rawCurrentGoals.findIndex((h) => h.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newGoalsList = [...rawCurrentGoals];
    const [draggedItem] = newGoalsList.splice(draggedIndex, 1);
    newGoalsList.splice(targetIndex, 0, draggedItem);

    withSync(async () => {
      const batch = writeBatch(db);
      newGoalsList.forEach((goal, index) => {
        const goalRef = doc(db, 'artifacts', appId, 'users', user.uid, 'habits', goal.id);
        batch.update(goalRef, { order: index });
      });
      await batch.commit();
    });
  };

  const moveHabit = (id, direction) => {
    const index = rawCurrentGoals.findIndex((h) => h.id === id);
    if (index < 0) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === rawCurrentGoals.length - 1) return;

    const newGoalsList = [...rawCurrentGoals];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newGoalsList[index];
    newGoalsList[index] = newGoalsList[targetIndex];
    newGoalsList[targetIndex] = temp;

    withSync(async () => {
      const batch = writeBatch(db);
      newGoalsList.forEach((goal, idx) => {
        const goalRef = doc(db, 'artifacts', appId, 'users', user.uid, 'habits', goal.id);
        batch.update(goalRef, { order: idx });
      });
      await batch.commit();
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(habits, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goood_backup_${todayStrLocal}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedHabits = JSON.parse(event.target.result);
        if (!Array.isArray(importedHabits)) throw new Error('Invalid');
        setSyncStatus('syncing');
        const batch = writeBatch(db);
        importedHabits.forEach((habit) => {
          const docId = habit.id || doc(collection(db, 'artifacts', appId, 'users', user.uid, 'habits')).id;
          const habitRef = doc(db, 'artifacts', appId, 'users', user.uid, 'habits', docId);
          batch.set(habitRef, { ...habit, id: docId }, { merge: true });
        });
        await batch.commit();
        setIsSettingsOpen(false);
        setSyncStatus('synced');
        showToast('Datos restaurados correctamente');
      } catch (error) {
        showToast('El archivo no es válido.');
        setSyncStatus('synced');
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const totalCompletedGoals = habits.filter((h) => h.completed).length;
  const bestStreakGlobal = Math.max(0, ...Object.values(habitStreaks), 0);
  const activeStreakGlobal = Math.max(0, ...rawCurrentGoals.map(h => habitStreaks[h.id] || 0), 0);

  const completedCount = rawCurrentGoals.filter((h) => h.completed).length;
  const totalCount = rawCurrentGoals.filter(h => !h.isCategoryPlaceholder).length;
  const dailyProgress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const currentMonthStr = selectedDateStr.substring(0, 7);
  const monthlyHabits = useMemo(() => habits.filter(h => h.date.startsWith(currentMonthStr) && !h.isCategoryPlaceholder), [habits, currentMonthStr]);
  const monthlyCompleted = monthlyHabits.filter(h => h.completed).length;
  const monthlyTotal = monthlyHabits.length;
  const monthlyProgress = monthlyTotal === 0 ? 0 : Math.round((monthlyCompleted / monthlyTotal) * 100);

  const displayProgress = progressView === 'daily' ? dailyProgress : monthlyProgress;
  const displayTotalCount = progressView === 'daily' ? totalCount : monthlyTotal;
  const displayCompletedCount = progressView === 'daily' ? completedCount : monthlyCompleted;

  const levelInfo = getLevelInfo(userProfile?.xp || 0);

  const getDisplayDate = () => {
    if (selectedDateStr === todayStrLocal) return 'Hoy';
    const d = new Date(selectedDateStr + 'T12:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const heatmapData = useMemo(() => {
     const data = [];
     let start = new Date(todayStrLocal + 'T12:00:00');
     start.setDate(start.getDate() - 27); 

     for(let i=0; i<28; i++) {
         const dateStr = getFormatDateStr(start);
         const dayHabits = habits.filter(h => h.date === dateStr && !h.isCategoryPlaceholder);
         const done = dayHabits.filter(h => h.completed).length;
         const total = dayHabits.length;
         const percent = total === 0 ? -1 : Math.round((done/total)*100);
         data.push({ date: dateStr, percent });
         start.setDate(start.getDate() + 1);
     }
     return data;
  }, [habits, todayStrLocal]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#007AFF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6 text-[#1D1D1F] animate-in fade-in duration-700">
        <div className="w-28 h-28 bg-white text-[#007AFF] rounded-[32px] flex items-center justify-center shadow-sm mb-10 transition-transform hover:scale-105 duration-500">
          <Target size={56} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-center text-gray-900">Goood.</h1>
        <p className="text-[17px] md:text-[19px] text-gray-500 font-medium mb-14 text-center max-w-[320px] leading-relaxed">
          Construye hábitos. Mantén tu racha. Alcanza tus metas diarias.
        </p>

        <div className="w-full max-w-[340px] space-y-4">
          <button onClick={loginWithGoogle} className="w-full flex items-center justify-center gap-3 bg-white border border-black/[0.05] text-gray-800 font-bold py-4 px-4 rounded-[24px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </button>
          
          <button onClick={loginAsGuest} className="w-full flex items-center justify-center gap-3 bg-[#007AFF] text-white font-bold py-4 px-4 rounded-[24px] shadow-sm hover:bg-[#006ae6] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95">
            Ingresar como invitado
          </button>
        </div>
      </div>
    );
  }

  if (user && userProfile && (!userProfile.firstName || !userProfile.lastName)) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
         <div className="bg-white rounded-[36px] p-8 md:p-10 w-full max-w-md shadow-md border border-black/[0.02]">
             <div className="w-16 h-16 bg-[#007AFF]/10 text-[#007AFF] rounded-[20px] flex items-center justify-center mb-6">
                <User size={32} strokeWidth={2.5} />
             </div>
             <h2 className="text-[26px] font-extrabold tracking-tight text-gray-900 mb-2">Bienvenido a Goood.</h2>
             <p className="text-[15px] text-gray-500 mb-8 leading-relaxed">Para personalizar tu experiencia y seguir tu progreso, ¿cómo te llamas?</p>
             
             <form onSubmit={saveProfileName} className="space-y-4">
                 <input type="text" required placeholder="Nombre" value={tempFName} onChange={(e) => setTempFName(e.target.value)} className="w-full bg-[#F2F2F7] border border-transparent rounded-[20px] px-5 py-4 text-[16px] font-medium text-gray-900 focus:bg-white focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10 transition-all outline-none" />
                 <input type="text" required placeholder="Apellido" value={tempLName} onChange={(e) => setTempLName(e.target.value)} className="w-full bg-[#F2F2F7] border border-transparent rounded-[20px] px-5 py-4 text-[16px] font-medium text-gray-900 focus:bg-white focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10 transition-all outline-none" />
                 <button type="submit" disabled={!tempFName.trim() || !tempLName.trim()} className="w-full bg-[#007AFF] text-white rounded-[20px] py-4 mt-4 font-bold text-[16px] hover:bg-[#006ae6] shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 mt-8">
                    Comenzar aventura
                 </button>
             </form>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-[#1D1D1F] font-sans selection:bg-[#007AFF]/20 pb-32 transition-colors duration-500">
      
      {/* Estilos Globales iOS */}
      <style dangerouslySetInnerHTML={{__html: `
        body { overscroll-behavior-y: none; -webkit-overflow-scrolling: touch; touch-action: manipulation; }
        input, textarea, button, select, a { -webkit-tap-highlight-color: transparent; }
        input[type="text"], input[type="date"], textarea { font-size: 16px !important; }
        .category-scrollbar::-webkit-scrollbar { height: 5px; }
        .category-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
        .category-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .category-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        @keyframes fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(360deg); opacity: 0; } }
        .confetti-piece { position: absolute; top: -20px; animation: fall linear forwards; }
      `}} />

      {showConfetti && <ConfettiOverlay />}

      {/* Toast Deshacer (Undo) */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-out ${toast.visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="bg-gray-900/95 backdrop-blur-md text-white px-5 py-3 md:px-6 md:py-4 rounded-full shadow-lg flex items-center gap-3 md:gap-4 border border-white/10 w-max max-w-[90vw] md:max-w-md mx-auto">
          <span className="text-[13px] md:text-[15px] font-medium tracking-wide flex items-center gap-2 truncate">
             <Star size={16} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
             <span className="truncate">{toast.message}</span>
          </span>
          {toast.onUndo && (
            <>
              <div className="w-px h-4 md:h-5 bg-white/20 flex-shrink-0"></div>
              <button onClick={toast.onUndo} className="flex items-center gap-1.5 text-[#4da6ff] font-bold text-[12px] md:text-[14px] hover:text-white active:scale-95 transition-all uppercase tracking-wider flex-shrink-0">
                <RotateCcw size={14} className="md:w-4 md:h-4" strokeWidth={3} /> Deshacer
              </button>
            </>
          )}
        </div>
      </div>

      {/* HEADER COMPACTO */}
      <header className="sticky top-0 z-30 bg-[#F2F2F7]/90 backdrop-blur-xl border-b border-black/[0.03] pt-4 md:pt-5 px-4 md:px-6 pb-3 transition-all duration-300">
        <div className="w-full max-w-md md:max-w-3xl lg:max-w-6xl mx-auto flex flex-col gap-3">
          
          {/* Fila 1: Nube, Perfil Compacto, Ajustes */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
               {userProfile && userProfile.firstName && (
                 <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2 bg-white/80 hover:bg-white p-1.5 pr-4 rounded-full shadow-sm border border-black/[0.03] transition-all active:scale-95">
                    <div className="w-8 h-8 bg-[#007AFF] text-white rounded-full flex items-center justify-center text-[12px] font-bold shadow-inner">
                       {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                    </div>
                    <div className="flex flex-col items-start">
                       <span className="text-[12px] font-extrabold text-gray-900 leading-none">{userProfile.firstName}</span>
                       <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] text-[#007AFF] font-bold uppercase tracking-widest leading-none">Nvl {levelInfo.level}</span>
                          <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                             <div className="h-full bg-[#007AFF] rounded-full" style={{ width: `${levelInfo.progress}%` }}></div>
                          </div>
                       </div>
                    </div>
                 </button>
               )}
            </div>
            
            <div className="flex items-center gap-2.5">
               <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 mr-2">
                 {syncStatus === 'connecting' && <><Cloud size={12} className="animate-pulse" /> Conectando</>}
                 {syncStatus === 'syncing' && <><Cloud size={12} className="text-[#007AFF] animate-bounce" /> Guardando</>}
                 {syncStatus === 'offline' && <><CloudOff size={12} className="text-gray-400" /> Offline</>}
                 {syncStatus === 'synced' && <><Cloud size={12} className="text-green-500" /> Sincronizado</>}
               </span>
               <button onClick={() => setIsSettingsOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-500 hover:text-[#007AFF] hover:shadow-md transition-all duration-300 active:scale-95">
                 <Settings size={16} />
               </button>
            </div>
          </div>

          {/* Fila 2: Fecha y Acciones */}
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                {selectedDateStr === todayStrLocal ? 'Tu Día' : 'Historial'}
              </span>
              <h1 className="text-[20px] md:text-[24px] font-extrabold tracking-tight capitalize text-gray-900 leading-none">
                {getDisplayDate()}
              </h1>
            </div>

            <div className="flex gap-1.5 items-center">
              {selectedDateStr !== todayStrLocal && (
                <button onClick={() => setSelectedDateStr(todayStrLocal)} className="px-3 h-8 rounded-full bg-[#007AFF]/10 text-[#007AFF] font-bold text-[12px] flex items-center justify-center transition-all duration-300 animate-in fade-in zoom-in hover:bg-[#007AFF]/20 active:scale-95">
                  Hoy
                </button>
              )}
              <label className="relative w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer active:scale-95 border border-black/[0.02]">
                <input type="date" value={selectedDateStr} onChange={(e) => { if (e.target.value) setSelectedDateStr(e.target.value); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <CalendarDays size={14} className="text-gray-600 pointer-events-none" />
              </label>
              <button onClick={() => setIsEditing(!isEditing)} className={`h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border relative z-20 active:scale-95 overflow-hidden ${isEditing ? 'bg-[#34C759] text-white border-[#34C759] w-8' : 'bg-white text-gray-700 border-black/[0.03] hover:shadow-md px-3'}`}>
                {isEditing ? <Check size={16} strokeWidth={3.5} className="text-white" /> : <span className="text-[12px] font-bold">Editar</span>}
              </button>
            </div>
          </div>

          {/* Fila 3: Calendario Delgado */}
          <div className="flex items-center justify-between gap-1 relative mt-1">
            <button onClick={() => shiftDate(-1)} className="p-1 text-gray-400 hover:text-[#007AFF] transition-colors active:scale-90 z-10"><ChevronLeft size={20} strokeWidth={3} /></button>
            <div key={calendarKey} className={`flex-1 max-w-3xl mx-auto flex items-stretch justify-between gap-0.5 md:gap-1 bg-white/40 backdrop-blur-2xl border border-white/60 shadow-sm rounded-[16px] p-1 relative overflow-hidden animate-in fade-in duration-300 ${slideDirection === 'right' ? 'slide-in-from-right-4' : slideDirection === 'left' ? 'slide-in-from-left-4' : ''}`}>
              {calendarDates.map((d, i) => {
                const dStr = getFormatDateStr(d);
                const isSelected = dStr === selectedDateStr;
                const isToday = dStr === todayStrLocal;
                const isHiddenOnMobile = i === 0 || i === 6;

                return (
                  <button key={dStr} onClick={() => setSelectedDateStr(dStr)} className={`relative flex-1 flex flex-col items-center justify-center py-1.5 rounded-[12px] transition-all duration-500 ease-out z-10 ${isHiddenOnMobile ? 'hidden sm:flex' : 'flex'} ${isSelected ? 'bg-[#007AFF] text-white shadow-sm scale-[1.02]' : 'text-gray-500 hover:bg-white/70 hover:text-gray-900 hover:scale-[1.02]'}`}>
                    <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors duration-300 leading-none mb-1 ${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                      {d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}
                    </span>
                    <span className={`text-[14px] md:text-[16px] font-extrabold leading-none transition-colors duration-300 ${isSelected ? 'text-white' : (isToday ? 'text-[#007AFF]' : 'text-gray-800')}`}>
                      {d.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => shiftDate(1)} className="p-1 text-gray-400 hover:text-[#007AFF] transition-colors active:scale-90 z-10"><ChevronRight size={20} strokeWidth={3} /></button>
          </div>

          {/* Fila 4: Filtros Pequeños */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 category-scrollbar snap-x items-center mt-1">
             <Filter size={14} className="text-gray-400 flex-shrink-0 ml-1 mr-1" />
             <button onClick={()=> {setFilterMode('all'); setCategoryFilter('all');}} className={`flex-shrink-0 snap-start px-3 py-1.5 text-[11px] font-bold rounded-full transition-all duration-300 ${filterMode === 'all' && categoryFilter === 'all' ? 'bg-black text-white shadow-sm' : 'bg-white/60 text-gray-600 hover:bg-white'}`}>
                Todo
             </button>
             <button onClick={()=> {setFilterMode('pending'); setCategoryFilter('all');}} className={`flex-shrink-0 snap-start px-3 py-1.5 text-[11px] font-bold rounded-full transition-all duration-300 ${filterMode === 'pending' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white/60 text-gray-600 hover:bg-white'}`}>
                Pendientes
             </button>
             <button onClick={()=> {setFilterMode('completed'); setCategoryFilter('all');}} className={`flex-shrink-0 snap-start px-3 py-1.5 text-[11px] font-bold rounded-full transition-all duration-300 ${filterMode === 'completed' ? 'bg-[#34C759] text-white shadow-sm' : 'bg-white/60 text-gray-600 hover:bg-white'}`}>
                Completadas
             </button>
             
             {uniqueCategories.length > 0 && <div className="w-px h-4 bg-black/10 mx-1 flex-shrink-0"></div>}
             
             {uniqueCategories.map(cat => (
                <button key={cat} onClick={()=> {setCategoryFilter(cat); setFilterMode('all');}} className={`flex-shrink-0 snap-start px-3 py-1.5 text-[11px] font-bold rounded-full transition-all duration-300 border ${categoryFilter === cat ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-sm' : 'bg-white/60 text-gray-600 border-transparent hover:bg-white hover:border-gray-200'}`}>
                  {cat}
                </button>
             ))}
          </div>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full max-w-md md:max-w-3xl lg:max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-8">
        
        {/* Metas Pendientes */}
        {selectedDateStr === todayStrLocal && pendingGoals.length > 0 && !isEditing && (
          <section>
            <h2 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
              <Inbox size={14} className="text-gray-400" /> Metas Pendientes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {groupedPendingGoals.map((item) => {
                if (item.isCategoryGroup) {
                  return <CategoryCard key={item.id} group={item} habitStreaks={habitStreaks} isPendingMode={true} isEditing={isEditing} onToggle={toggleHabit} onDelete={deleteHabit} onEdit={openEditModal} onMoveToToday={moveToToday} onMove={moveHabit} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDrop={handleDrop} onDeleteGroup={handleDeleteCategory} onAddInsideCategory={openAddModalForCategory} onEditGroup={openEditCategoryModal} onTogglePin={toggleCategoryPin} isPinned={userProfile?.pinnedCategories?.includes(item.name)} />
                }
                return <HabitCard key={item.id} habit={item} computedStreak={habitStreaks[item.id] || 0} isPendingMode={true} isEditing={isEditing} onToggle={toggleHabit} onDelete={deleteHabit} onEdit={openEditModal} onMoveToToday={moveToToday} onMove={moveHabit} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDrop={handleDrop} />
              })}
            </div>
          </section>
        )}

        {/* Metas del Día */}
        <section>
            <h2 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
              <Calendar size={14} className="text-gray-400" /> Plan del Día
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {groupedCurrentGoals.map((item) => {
                if (item.isCategoryGroup) {
                   return <CategoryCard key={item.id} group={item} habitStreaks={habitStreaks} isPendingMode={false} isEditing={isEditing} onToggle={toggleHabit} onDelete={deleteHabit} onEdit={openEditModal} onMoveToToday={moveToToday} onMove={moveHabit} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDrop={handleDrop} onDeleteGroup={handleDeleteCategory} onAddInsideCategory={openAddModalForCategory} onEditGroup={openEditCategoryModal} onTogglePin={toggleCategoryPin} isPinned={userProfile?.pinnedCategories?.includes(item.name)} />
                }
                return <HabitCard key={item.id} habit={item} computedStreak={habitStreaks[item.id] || 0} isPendingMode={false} isEditing={isEditing} onToggle={toggleHabit} onDelete={deleteHabit} onEdit={openEditModal} onMoveToToday={moveToToday} onMove={moveHabit} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDrop={handleDrop} />
              })}

            {currentGoals.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 px-6 border-[2px] border-dashed border-gray-200/60 rounded-[24px] bg-white/40 transition-all duration-500 hover:bg-white/80">
                <div className="w-16 h-16 bg-gray-100 rounded-[16px] flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <CalendarDays size={32} className="text-gray-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-[18px] font-bold text-gray-800 mb-1.5 tracking-tight">Día en blanco</h3>
                <p className="text-gray-500 text-[14px] font-medium max-w-sm mx-auto leading-relaxed">
                  {selectedDateStr === todayStrLocal ? 'Toca el botón + para organizar tu día.' : 'No hay metas registradas o no coinciden con tu filtro.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FAB */}
      <div className="fixed bottom-8 left-0 right-0 md:left-auto md:right-8 pointer-events-none flex justify-center md:justify-end z-40">
        <button onClick={openAddModal} className="pointer-events-auto flex items-center gap-2.5 bg-[#007AFF] backdrop-blur-md text-white px-6 py-4 rounded-full font-bold text-[16px] shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-300">
          <Plus size={20} strokeWidth={3} /> <span className="md:hidden lg:inline">Añadir Meta</span>
        </button>
      </div>

      {/* Modal Editar Categoría Masiva Minimalista */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300" onClick={() => setIsCategoryModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md lg:max-w-lg rounded-t-[28px] md:rounded-[28px] p-5 md:p-6 pt-4 md:pt-5 z-10 animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 shadow-xl flex flex-col max-h-[85vh]">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden flex-shrink-0"></div>
            
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-[20px] font-extrabold tracking-tight text-gray-900">Editar Categoría</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="w-8 h-8 bg-[#F2F2F7] rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={saveCategoryEdit} className="overflow-y-auto pr-1 pb-1 space-y-4 category-scrollbar">
              <div>
                <label className="block text-[12px] font-bold text-gray-800 mb-1.5">Nombre</label>
                <input type="text" autoFocus value={editCatName} onChange={(e) => setEditCatName(e.target.value)} className="w-full bg-[#F2F2F7] border border-transparent rounded-[12px] px-4 py-2.5 text-[14px] font-bold text-gray-900 focus:bg-white focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10 transition-all outline-none shadow-sm uppercase" />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-800 mb-2">Icono</label>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2 snap-x category-scrollbar">
                  {Object.keys(ICON_CATEGORIES).map(cat => (
                    <button key={cat} type="button" onClick={() => setEditCatIconCategory(cat)} className={`flex-shrink-0 snap-start px-3 py-1 text-[11px] font-bold rounded-full transition-all duration-300 border ${editCatIconCategory === cat ? 'bg-black text-white border-black shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-7 sm:grid-cols-9 gap-2 p-2.5 bg-[#F2F2F7] rounded-[16px]">
                  {Object.keys(ICON_CATEGORIES[editCatIconCategory]).map((iconName) => {
                    const IconComp = ICON_CATEGORIES[editCatIconCategory][iconName];
                    return (
                      <button key={iconName} type="button" onClick={() => setEditCatIcon(iconName)} className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-200 mx-auto ${editCatIcon === iconName ? `bg-black text-white shadow-md scale-110` : 'bg-transparent text-gray-500 hover:bg-gray-200'}`}>
                        <IconComp size={16} strokeWidth={2.5} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-800 mb-2">
                  <Palette size={14} /> Color
                </label>
                <div className="flex flex-wrap gap-2 p-1.5 overflow-visible">
                  {HABIT_COLORS.map((color) => (
                    <button key={color} type="button" onClick={() => setEditCatColor(color)} className={`flex-shrink-0 w-6 h-6 rounded-full ${color} transition-all duration-200 relative ${editCatColor === color ? 'scale-110 shadow-md border-[1.5px] border-white ring-2 ring-black z-10' : 'opacity-80 hover:opacity-100 hover:scale-105 border-2 border-transparent'}`} />
                  ))}
                </div>
              </div>

              <button type="submit" disabled={!editCatName.trim()} className="w-full bg-[#007AFF] text-white rounded-[16px] py-3 font-bold text-[14px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 mt-2">
                Actualizar Todo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Añadir / Editar Meta Minimalista */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md lg:max-w-lg rounded-t-[28px] md:rounded-[28px] p-5 md:p-6 pt-4 md:pt-5 z-10 animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 shadow-xl flex flex-col max-h-[85vh]">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden flex-shrink-0"></div>
            
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-[20px] md:text-[22px] font-extrabold tracking-tight text-gray-900">
                {habitToEdit ? 'Editar Meta' : (modalMode === 'category' ? 'Nueva Categoría' : 'Añadir')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-[#F2F2F7] rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={saveHabit} className="overflow-y-auto pr-1 pb-1 space-y-4 category-scrollbar">
              
              {!habitToEdit && (
                <div className="flex bg-[#F2F2F7] p-1 rounded-full w-full max-w-[280px] mx-auto mb-2 overflow-x-auto category-scrollbar">
                  <button type="button" onClick={() => setModalMode('single')} className={`flex-1 py-1 px-1.5 text-[11px] font-bold rounded-full transition-all duration-300 ${modalMode === 'single' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    Individual
                  </button>
                  <button type="button" onClick={() => setModalMode('bulk')} className={`flex-1 py-1 px-1.5 text-[11px] font-bold rounded-full transition-all duration-300 ${modalMode === 'bulk' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    Múltiple
                  </button>
                  <button type="button" onClick={() => setModalMode('category')} className={`flex-1 py-1 px-1.5 text-[11px] font-bold rounded-full transition-all duration-300 ${modalMode === 'category' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    Categoría
                  </button>
                </div>
              )}

              {modalMode === 'category' && (
                  <div>
                    <label className="block text-[12px] font-bold text-gray-800 mb-1.5">Nombre Categoría</label>
                    <input type="text" autoFocus placeholder="Ej. Finanzas, Viajes..." value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} className="w-full bg-[#F2F2F7] border border-transparent rounded-[12px] px-4 py-2.5 text-[14px] font-bold text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10 transition-all outline-none shadow-sm uppercase" />
                  </div>
              )}

              {modalMode !== 'category' && (
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-[12px] font-bold text-gray-800 mb-1.5">Categoría (Opcional)</label>
                    <input type="text" list="existing-categories" placeholder="Ej. Casa, Trabajo..." value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} className="w-full bg-[#F2F2F7] border border-transparent rounded-[12px] px-4 py-2 text-[13px] font-bold text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10 transition-all outline-none shadow-sm uppercase" />
                    <datalist id="existing-categories">
                        {uniqueCategories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-gray-800 mb-1.5">{modalMode === 'bulk' ? 'Tus Metas' : 'Meta'}</label>
                    {modalMode === 'bulk' ? (
                      <div className="space-y-2">
                          {bulkItems.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-2 bg-[#F2F2F7] rounded-[12px] px-3 py-1 border border-transparent focus-within:border-[#007AFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#007AFF]/10 transition-all shadow-sm">
                                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-gray-400 font-bold text-[9px] shadow-sm flex-shrink-0">{idx + 1}</div>
                                <input type="text" placeholder={`Añadir meta...`} value={item} onChange={(e) => {
                                      const newItems = [...bulkItems];
                                      newItems[idx] = e.target.value;
                                      if (idx === bulkItems.length - 1 && e.target.value.trim() !== '') newItems.push('');
                                      setBulkItems(newItems);
                                   }} className="w-full bg-transparent py-1.5 text-[14px] font-medium text-gray-900 outline-none" />
                                {bulkItems.length > 1 && idx !== bulkItems.length - 1 && (
                                   <button type="button" onClick={() => setBulkItems(bulkItems.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 transition-colors p-1" title="Eliminar fila"><X size={14} strokeWidth={3} /></button>
                                )}
                             </div>
                          ))}
                      </div>
                    ) : (
                      <input type="text" autoFocus placeholder="Ej. Leer 15 páginas..." value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} className="w-full bg-[#F2F2F7] border border-transparent rounded-[12px] px-4 py-2.5 text-[14px] font-medium text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10 transition-all outline-none shadow-sm" />
                    )}
                  </div>
                  
                  {modalMode === 'single' && (
                     <div>
                        <label className="block text-[12px] font-bold text-gray-800 mb-1.5">Notas</label>
                        <textarea placeholder="Detalles (ej. rutina del gimnasio)..." value={newHabitNotes} onChange={(e) => setNewHabitNotes(e.target.value)} rows={2} className="w-full bg-[#F2F2F7] border border-transparent rounded-[12px] px-4 py-2 text-[13px] font-medium text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10 transition-all outline-none shadow-sm resize-none leading-relaxed" />
                     </div>
                  )}
                </div>
              )}

              {!habitToEdit && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[12px] font-bold text-gray-800">¿Cuándo?</label>
                    <div className="flex bg-[#F2F2F7] p-1 rounded-full">
                      <button type="button" onClick={() => setScheduleMode('single')} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all duration-300 ${scheduleMode === 'single' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Hoy</button>
                      <button type="button" onClick={() => setScheduleMode('recurring')} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all duration-300 ${scheduleMode === 'recurring' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Días</button>
                      <button type="button" onClick={() => setScheduleMode('range')} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all duration-300 ${scheduleMode === 'range' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Rango</button>
                    </div>
                  </div>

                  {scheduleMode === 'recurring' && (
                     <div className="bg-[#F2F2F7] p-3 rounded-[16px]">
                        <p className="text-[11px] text-gray-500 font-medium mb-2">Repetir por 8 semanas los días:</p>
                        <div className="flex justify-between gap-1">
                           {DAYS_OF_WEEK.map(day => (
                               <button key={day.id} type="button" onClick={() => toggleRecurringDay(day.id)} className={`w-8 h-8 md:w-9 md:h-9 rounded-full font-bold text-[12px] transition-all shadow-sm ${recurringDays.includes(day.id) ? 'bg-[#007AFF] text-white scale-105' : 'bg-white text-gray-400 border border-gray-200'}`}>
                                  {day.label}
                               </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {scheduleMode !== 'recurring' && (
                    <div className="flex gap-3 items-center bg-[#F2F2F7] p-2.5 rounded-[16px]">
                      <div className="flex-1">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2 mb-1">Inicio</p>
                        <label className="relative block w-full bg-white rounded-[10px] border border-black/5 focus-within:border-[#007AFF] shadow-sm transition-colors cursor-pointer">
                          <input type="date" value={selectedDateStr} onChange={(e) => { if (e.target.value) { setSelectedDateStr(e.target.value); if (e.target.value > rangeEndDate) setRangeEndDate(e.target.value); } }} className="w-full h-full px-3 py-2 text-[13px] font-medium outline-none bg-transparent cursor-pointer" />
                        </label>
                      </div>
                      {scheduleMode === 'range' && (
                        <>
                          <ArrowRight size={14} className="text-gray-400 flex-shrink-0 mt-4" />
                          <div className="flex-1">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2 mb-1">Fin</p>
                            <label className="relative block w-full bg-white rounded-[10px] border border-black/5 focus-within:border-[#007AFF] shadow-sm transition-colors cursor-pointer">
                              <input type="date" min={selectedDateStr} value={rangeEndDate} onChange={(e) => { if(e.target.value) setRangeEndDate(e.target.value); }} className="w-full h-full px-3 py-2 text-[13px] font-medium outline-none bg-transparent cursor-pointer" />
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {modalMode !== 'category' && uniqueCategories.includes(categoryInput.trim()) ? (
                 <div className="bg-blue-50 text-[#007AFF] p-4 rounded-[16px] flex items-center gap-3 text-[12px] font-medium border border-blue-100">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                       <FolderIcon size={14} strokeWidth={2.5} />
                    </div>
                    <p className="leading-snug">Heredará estilo de <b>"{categoryInput.trim()}"</b>.</p>
                 </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-800 mb-2">Icono</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-2 snap-x category-scrollbar">
                      {Object.keys(ICON_CATEGORIES).map(cat => (
                        <button key={cat} type="button" onClick={() => setSelectedIconCategory(cat)} className={`flex-shrink-0 snap-start px-3 py-1 text-[11px] font-bold rounded-full transition-all duration-300 border ${selectedIconCategory === cat ? 'bg-black text-white border-black shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 sm:grid-cols-9 gap-2 p-2.5 bg-[#F2F2F7] rounded-[16px]">
                      {Object.keys(ICON_CATEGORIES[selectedIconCategory]).map((iconName) => {
                        const IconComp = ICON_CATEGORIES[selectedIconCategory][iconName];
                        return (
                          <button key={iconName} type="button" onClick={() => setSelectedIcon(iconName)} className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-all duration-200 mx-auto ${selectedIcon === iconName ? `bg-black text-white shadow-md scale-110` : 'bg-transparent text-gray-500 hover:bg-gray-200'}`}>
                            <IconComp size={16} strokeWidth={2.5} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-800 mb-2">
                      <Palette size={14} /> Color
                    </label>
                    <div className="flex flex-wrap gap-2 p-1.5 overflow-visible">
                      {HABIT_COLORS.map((color) => (
                        <button key={color} type="button" onClick={() => setSelectedColor(color)} className={`flex-shrink-0 w-6 h-6 rounded-full ${color} transition-all duration-200 relative ${selectedColor === color ? 'scale-110 shadow-md border-[1.5px] border-white ring-2 ring-black z-10' : 'opacity-80 hover:opacity-100 hover:scale-105 border-2 border-transparent'}`} />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button type="submit" disabled={(modalMode === 'category' ? !categoryInput.trim() : (modalMode === 'bulk' ? !bulkItems.some(s => s.trim().length > 0) : !newHabitName.trim())) || (scheduleMode === 'range' && selectedDateStr > rangeEndDate) || (scheduleMode === 'recurring' && recurringDays.length === 0)} className="w-full bg-[#007AFF] text-white rounded-[16px] py-3 font-bold text-[14px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 mt-1">
                {habitToEdit ? 'Guardar Cambios' : (modalMode === 'category' ? 'Crear Categoría' : 'Añadir Metas')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajustes y Perfil fusionados (Reutilizando estructura base) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300" onClick={() => setIsSettingsOpen(false)}></div>
          <div className="bg-white w-full max-w-md lg:max-w-lg rounded-t-[28px] md:rounded-[28px] p-5 md:p-6 pt-4 z-10 animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 shadow-xl">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden"></div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] md:text-[22px] font-extrabold tracking-tight text-gray-900">Ajustes</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 bg-[#F2F2F7] rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-6 mb-2 category-scrollbar overflow-y-auto max-h-[70vh] pr-1">
              <div>
                <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">App & Tutorial</h3>
                <div className="bg-[#F2F2F7] rounded-[20px] p-2 border border-black/[0.02]">
                  <button onClick={openTutorialFromSettings} className="w-full flex items-center gap-3 p-3 rounded-[16px] hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md text-left group">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#007AFF] group-hover:scale-105 transition-transform duration-300">
                      <Target size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[14px] text-gray-900 tracking-tight">Ver Tutorial Inicial</p>
                      <p className="text-[12px] text-gray-500 font-medium">Aprende a usar la app e instalarla</p>
                    </div>
                  </button>
                  <div className="h-px bg-gray-200/80 my-1 mx-4"></div>
                  <button onClick={() => setSoundEnabled(!soundEnabled)} className="w-full flex items-center justify-between p-3 rounded-[16px] hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md text-left group">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${soundEnabled ? 'bg-white text-purple-500' : 'bg-gray-200 text-gray-400'}`}>
                          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-[14px] text-gray-900 tracking-tight">Efectos de Sonido</p>
                          <p className="text-[12px] text-gray-500 font-medium">{soundEnabled ? 'Activados' : 'Desactivados'}</p>
                        </div>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${soundEnabled ? 'bg-[#34C759]' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${soundEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Notificaciones</h3>
                <div className="bg-[#F2F2F7] rounded-[20px] p-4 border border-black/[0.02]">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center transition-colors ${notificationsEnabled ? 'bg-[#007AFF] text-white' : 'bg-white text-gray-400'}`}>
                            <Bell size={18} />
                         </div>
                         <div>
                            <p className="font-bold text-[14px] text-gray-900 tracking-tight">Recordatorio Diario</p>
                            <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">Aviso a las 20:00 si tienes metas pendientes.</p>
                         </div>
                      </div>
                      {!notificationsEnabled && <button onClick={requestNotificationPermission} className="text-[11px] font-bold text-[#007AFF] bg-[#007AFF]/10 px-3 py-1.5 rounded-full active:scale-95 ml-2">Activar</button>}
                      {notificationsEnabled && <span className="text-[11px] font-bold text-green-600 bg-green-100 px-3 py-1.5 rounded-full ml-2">Activo</span>}
                   </div>
                </div>
              </div>

              <div>
                <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Respaldo y Sistema</h3>
                <div className="bg-[#F2F2F7] rounded-[20px] p-2 border border-black/[0.02]">
                  <button onClick={exportData} className="w-full flex items-center gap-3 p-3 rounded-[16px] hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md text-left group">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#007AFF] group-hover:scale-105 transition-transform duration-300">
                      <Download size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[14px] text-gray-900 tracking-tight">Exportar Respaldo</p>
                      <p className="text-[12px] text-gray-500 font-medium">Descarga un archivo .json</p>
                    </div>
                  </button>
                  <div className="h-px bg-gray-200/80 my-1 mx-4"></div>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 p-3 rounded-[16px] hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md text-left group">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-500 group-hover:scale-105 transition-transform duration-300">
                      <Upload size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[14px] text-gray-900 tracking-tight">Restaurar Datos</p>
                      <p className="text-[12px] text-gray-500 font-medium">Sube un respaldo previo</p>
                    </div>
                  </button>
                  <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={importData} />
                  <div className="h-px bg-gray-200/80 my-1 mx-4"></div>
                  <button onClick={clearAppCache} className="w-full flex items-center gap-3 p-3 rounded-[16px] hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md text-left group">
                     <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-600 group-hover:scale-105 transition-transform duration-300">
                       <RotateCcw size={18} />
                     </div>
                     <div>
                       <p className="font-bold text-[14px] text-gray-900 tracking-tight">Limpiar Caché</p>
                       <p className="text-[12px] text-gray-500 font-medium">Libera espacio local y recarga</p>
                     </div>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Cuenta Segura</h3>
                <div className="bg-[#F2F2F7] rounded-[20px] p-4 border border-black/[0.02] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="Perfil" className="w-10 h-10 rounded-full shadow-sm object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-[16px] shadow-sm">
                          {userProfile?.firstName ? userProfile.firstName.charAt(0).toUpperCase() : (user?.isAnonymous ? 'I' : 'U')}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-[14px] text-gray-900 tracking-tight">
                          {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : (user?.isAnonymous ? 'Usuario Invitado' : 'Usuario')}
                        </p>
                        <p className="text-[11px] text-green-600 font-bold flex items-center gap-1 mt-0.5">
                          <Cloud size={12} /> Activa y cifrada
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gray-200/80 my-0.5 mx-1"></div>
                  
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setIsTrashOpen(true)} className="w-full flex items-center justify-center gap-2 text-[13px] font-bold text-gray-700 hover:text-gray-900 bg-white shadow-sm border border-gray-200 hover:bg-gray-50 px-3 py-2.5 rounded-[14px] transition-colors active:scale-95">
                      <Trash size={16} /> Papelera de Reciclaje
                    </button>
                    {user?.isAnonymous && (
                      <button onClick={linkGoogleAccount} className="w-full flex items-center justify-center gap-2 text-[13px] font-bold text-gray-700 hover:text-gray-900 bg-white shadow-sm border border-gray-200 hover:bg-gray-50 px-3 py-2.5 rounded-[14px] transition-colors active:scale-95">
                        <Link size={16} /> Vincular con Google
                      </button>
                    )}
                    <button onClick={() => auth.signOut()} className="w-full flex items-center justify-center gap-2 text-[13px] font-bold text-gray-700 hover:text-gray-900 bg-white shadow-sm border border-gray-200 hover:bg-gray-50 px-3 py-2.5 rounded-[14px] transition-colors active:scale-95">
                      <LogOut size={16} /> Cerrar Sesión
                    </button>
                    <button onClick={deleteAccount} disabled={isDeletingAccount} className="w-full flex items-center justify-center gap-2 text-[13px] font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2.5 rounded-[14px] transition-colors active:scale-95 disabled:opacity-50">
                      <Trash2 size={16} /> {isDeletingAccount ? 'Eliminando...' : 'Eliminar Cuenta'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;