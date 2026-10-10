import { HeroIdeaGenerator } from '../../application/ports.js';
import type { HeroIdea } from '../../domain/hero-idea.js';

const FIRST_NAMES = [
  'Helena',
  'Caio',
  'Iara',
  'Tomás',
  'Lívia',
  'Rafael',
  'Nina',
  'Davi',
  'Joana',
  'Bruno',
];
const LAST_NAMES = [
  'Duarte',
  'Ramires',
  'Kowalski',
  'Ferreira',
  'Sato',
  'Moura',
  'Albuquerque',
  'Nogueira',
  'Pires',
  'Lacerda',
];
const UNIVERSES = ['Ômega', 'Nexus', 'Aurora', 'Vértice', 'Titãs'];

const ARCHETYPES = [
  {
    nickname: 'Brasa',
    power: 'Pirocinese',
    look: 'woman with glowing ember hair, charcoal armor with orange cracks',
    origin:
      'Sobreviveu a um incêndio numa siderúrgica e passou a absorver e moldar o calor ao redor.',
  },
  {
    nickname: 'Maré Alta',
    power: 'Hidrocinese',
    look: 'figure in deep blue suit with flowing water patterns, sea spray',
    origin:
      'Cresceu numa vila de pescadores e descobriu que as ondas respondem às suas emoções.',
  },
  {
    nickname: 'Estática',
    power: 'Eletrocinese',
    look: 'hero in black and electric yellow suit, crackling lightning around hands',
    origin:
      'Atingido por um raio durante uma tempestade no sertão, agora conduz e dispara eletricidade.',
  },
  {
    nickname: 'Raiz',
    power: 'Controle botânico',
    look: 'hero wrapped in living vines and leaves, green and brown tones, forest',
    origin:
      'Guardiã de uma reserva florestal, faz plantas crescerem em segundos para proteger quem precisa.',
  },
  {
    nickname: 'Cometa',
    power: 'Supervelocidade',
    look: 'runner in silver and red aerodynamic suit, motion trails, night city',
    origin:
      'Um acelerador de partículas falhou e deu a ele a capacidade de correr acima da velocidade do som.',
  },
  {
    nickname: 'Eco',
    power: 'Mimetismo sonoro',
    look: 'hero with sound wave visor, purple suit, concentric sound rings',
    origin:
      'Musicista que aprendeu a copiar e amplificar qualquer som, criando barreiras e ondas de choque.',
  },
];

export class DemoHeroIdeaGenerator extends HeroIdeaGenerator {
  constructor(private readonly random: () => number = Math.random) {
    super();
  }

  async generate(idea?: string): Promise<HeroIdea> {
    const pick = <T>(items: readonly T[]) =>
      items[Math.floor(this.random() * items.length)];
    const archetype = pick(ARCHETYPES);
    const year = 1960 + Math.floor(this.random() * 45);
    const month = 1 + Math.floor(this.random() * 12);
    const day = 1 + Math.floor(this.random() * 28);

    return {
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      nickname: archetype.nickname,
      dateOfBirth: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      universe: pick(UNIVERSES),
      mainPower: archetype.power,
      backstory: idea
        ? `${archetype.origin} (Modo demonstração: a ideia "${idea}" seria usada pela IA real.)`
        : archetype.origin,
      avatarPrompt: archetype.look,
    };
  }
}
