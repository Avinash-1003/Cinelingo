// ─────────────────────────────────────────────────────────────────────────────
// ZUSTAND GAME STORE — Single source of truth for K-Drama Simulator
// ─────────────────────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { NPCS } from '../data/npcs';
import { getDialogueNode, getEpisodeStartDialogue, getFreeRoamDialogue } from '../data/dialogues';
import { EPISODES, isEpisodeUnlocked } from '../data/episodes';

const STORAGE_KEY = 'cinelingo_kdrama_save';

function loadSave() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* corrupt */ }
  return null;
}

function persistSave(state) {
  try {
    const saveData = {
      currentScene: state.currentScene,
      currentEpisode: state.currentEpisode,
      npcs: state.npcs,
      storyFlags: state.storyFlags,
      completedEpisodes: state.completedEpisodes,
      learnedWords: state.learnedWords,
      visitedLocations: state.visitedLocations,
      unlockedAchievements: state.unlockedAchievements,
      playerName: state.playerName,
      totalPlayTime: state.totalPlayTime,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  } catch { /* storage full */ }
}

const defaultNPCState = () => {
  const state = {};
  Object.keys(NPCS).forEach(id => {
    state[id] = { friendship: 0, trust: 0, met: false, conversationCount: 0 };
  });
  return state;
};

const initialState = {
  // Game phase
  gamePhase: 'menu', // 'menu' | 'episode_select' | 'playing' | 'dialogue' | 'transition'

  // Scene
  currentScene: 'cafe',
  previousScene: null,
  isTransitioning: false,

  // Episode
  currentEpisode: 1,
  activeEpisodeDialogue: null, // currently playing episode dialogue ID

  // Dialogue
  currentDialogueNode: null,
  isInDialogue: false,
  dialogueHistory: [],

  // Player
  playerName: 'Player',
  playerPosition: { x: 0, z: 0 },
  playerRotation: 0,

  // NPC Relationships
  npcs: defaultNPCState(),

  // Story
  storyFlags: {},
  completedEpisodes: [],

  // Language learning
  learnedWords: [],
  highlightedWord: null,

  // Exploration
  visitedLocations: [],

  // Achievements
  unlockedAchievements: [],

  // UI
  showEpisodeComplete: false,
  showAchievement: null,
  showLocationMap: false,
  textSpeed: 'normal', // 'slow' | 'normal' | 'fast'

  // Meta
  totalPlayTime: 0,
  isLoaded: false,
};

export const useGameStore = create((set, get) => ({
  ...initialState,

  // ── INITIALIZATION ──────────────────────────────────────────────────────
  initGame: () => {
    const save = loadSave();
    if (save) {
      set({
        ...save,
        gamePhase: 'menu',
        isInDialogue: false,
        currentDialogueNode: null,
        isTransitioning: false,
        showEpisodeComplete: false,
        showAchievement: null,
        isLoaded: true,
      });
    } else {
      set({ ...initialState, isLoaded: true });
    }
  },

  resetGame: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ ...initialState, isLoaded: true, gamePhase: 'menu' });
  },

  // ── GAME PHASE ──────────────────────────────────────────────────────────
  setGamePhase: (phase) => set({ gamePhase: phase }),

  startEpisode: (episodeNumber) => {
    const dialogueId = getEpisodeStartDialogue(episodeNumber);
    const episode = EPISODES.find(e => e.id === episodeNumber);
    if (!dialogueId || !episode) return;

    const startScene = episode.locations[0];
    const node = getDialogueNode(dialogueId);

    set({
      gamePhase: 'playing',
      currentEpisode: episodeNumber,
      activeEpisodeDialogue: dialogueId,
      currentScene: startScene,
      currentDialogueNode: node,
      isInDialogue: true,
      dialogueHistory: [],
    });

    // Track location visit
    const state = get();
    if (!state.visitedLocations.includes(startScene)) {
      set({ visitedLocations: [...state.visitedLocations, startScene] });
    }

    persistSave(get());
  },

  enterFreeRoam: () => {
    set({
      gamePhase: 'playing',
      isInDialogue: false,
      currentDialogueNode: null,
      activeEpisodeDialogue: null,
    });
  },

  // ── SCENE MANAGEMENT ───────────────────────────────────────────────────
  changeScene: (newScene) => {
    const state = get();
    set({
      isTransitioning: true,
      previousScene: state.currentScene,
    });

    setTimeout(() => {
      const visited = get().visitedLocations;
      set({
        currentScene: newScene,
        isTransitioning: false,
        playerPosition: { x: 0, z: 0 },
        playerRotation: 0,
        visitedLocations: visited.includes(newScene) ? visited : [...visited, newScene],
      });
      persistSave(get());
    }, 800);
  },

  // ── PLAYER MOVEMENT ────────────────────────────────────────────────────
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setPlayerRotation: (rot) => set({ playerRotation: rot }),

  // ── DIALOGUE SYSTEM ─────────────────────────────────────────────────────
  startDialogue: (dialogueId) => {
    const node = getDialogueNode(dialogueId);
    if (!node) return;
    set({
      currentDialogueNode: node,
      isInDialogue: true,
      gamePhase: 'dialogue',
    });
  },

  talkToNPC: (npcId) => {
    const state = get();
    const npcState = state.npcs[npcId];
    if (!npcState) return;

    // Mark as met
    if (!npcState.met) {
      set({
        npcs: {
          ...state.npcs,
          [npcId]: { ...npcState, met: true },
        },
      });
    }

    // Use free roam dialogue
    const dialogueId = getFreeRoamDialogue(npcId);
    if (dialogueId) {
      const node = getDialogueNode(dialogueId);
      set({
        currentDialogueNode: node,
        isInDialogue: true,
        gamePhase: 'dialogue',
      });
    }
  },

  advanceDialogue: (next) => {
    if (!next) {
      // End of dialogue
      const state = get();
      set({
        isInDialogue: false,
        currentDialogueNode: null,
        gamePhase: 'playing',
      });
      persistSave(get());
      return;
    }

    const node = getDialogueNode(next);
    if (!node) {
      set({ isInDialogue: false, currentDialogueNode: null, gamePhase: 'playing' });
      return;
    }

    const state = get();

    // Learn words from node if any
    let newWords = [...state.learnedWords];
    if (node.learnWords) {
      node.learnWords.forEach(w => {
        if (!newWords.includes(w)) newWords.push(w);
      });
    }

    set({
      currentDialogueNode: node,
      dialogueHistory: [...state.dialogueHistory, node.id],
      learnedWords: newWords,
    });
  },

  selectChoice: (choice) => {
    const state = get();

    // Apply effects
    if (choice.effects) {
      const newNPCs = { ...state.npcs };
      const newFlags = { ...state.storyFlags };

      // NPC relationship changes
      Object.entries(choice.effects).forEach(([key, val]) => {
        if (key === 'flags') {
          val.forEach(flag => { newFlags[flag] = true; });
        } else if (newNPCs[key]) {
          const npc = { ...newNPCs[key] };
          if (val.friendship) npc.friendship = Math.min(100, npc.friendship + val.friendship);
          if (val.trust) npc.trust = Math.min(100, npc.trust + val.trust);
          npc.conversationCount++;
          newNPCs[key] = npc;
        }
      });

      set({ npcs: newNPCs, storyFlags: newFlags });
    }

    // Advance to next node
    get().advanceDialogue(choice.next);

    // Check for episode end
    const currentNode = get().currentDialogueNode;
    if (currentNode?.isEpisodeEnd) {
      get().completeEpisode(currentNode.episode);
    }
  },

  handleNarrationNext: () => {
    const state = get();
    const node = state.currentDialogueNode;
    if (!node) return;

    // Learn words
    let newWords = [...state.learnedWords];
    if (node.learnWords) {
      node.learnWords.forEach(w => {
        if (!newWords.includes(w)) newWords.push(w);
      });
      set({ learnedWords: newWords });
    }

    if (node.isEpisodeEnd) {
      get().completeEpisode(node.episode);
      return;
    }

    if (node.next) {
      get().advanceDialogue(node.next);
    } else {
      set({ isInDialogue: false, currentDialogueNode: null, gamePhase: 'playing' });
    }
  },

  // ── EPISODE COMPLETION ──────────────────────────────────────────────────
  completeEpisode: (episodeNumber) => {
    const state = get();
    const newCompleted = state.completedEpisodes.includes(episodeNumber)
      ? state.completedEpisodes
      : [...state.completedEpisodes, episodeNumber];

    set({
      completedEpisodes: newCompleted,
      showEpisodeComplete: true,
      isInDialogue: false,
      currentDialogueNode: null,
      gamePhase: 'playing',
    });

    // Check achievements
    const episode = EPISODES.find(e => e.id === episodeNumber);
    if (episode?.rewards?.achievementId) {
      get().unlockAchievement(episode.rewards.achievementId);
    }

    // Check word collector achievements
    const totalWords = get().learnedWords.length;
    if (totalWords >= 10) get().unlockAchievement('word_collector_10');
    if (totalWords >= 30) get().unlockAchievement('word_master_30');

    // Check explorer
    if (get().visitedLocations.length >= 3) get().unlockAchievement('explorer');

    persistSave(get());
  },

  dismissEpisodeComplete: () => set({ showEpisodeComplete: false }),

  // ── ACHIEVEMENTS ────────────────────────────────────────────────────────
  unlockAchievement: (achievementId) => {
    const state = get();
    if (state.unlockedAchievements.includes(achievementId)) return;

    set({
      unlockedAchievements: [...state.unlockedAchievements, achievementId],
      showAchievement: achievementId,
    });

    setTimeout(() => {
      set({ showAchievement: null });
    }, 3000);
  },

  // ── VOCABULARY ──────────────────────────────────────────────────────────
  setHighlightedWord: (wordId) => set({ highlightedWord: wordId }),
  clearHighlightedWord: () => set({ highlightedWord: null }),

  learnWord: (wordId) => {
    const state = get();
    if (!state.learnedWords.includes(wordId)) {
      set({ learnedWords: [...state.learnedWords, wordId] });
    }
  },

  // ── MAP / UI TOGGLES ───────────────────────────────────────────────────
  toggleLocationMap: () => set(s => ({ showLocationMap: !s.showLocationMap })),
  setTextSpeed: (speed) => set({ textSpeed: speed }),
}));
