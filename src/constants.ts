import { Track, LibraryItem, AddOn } from './types';

export const CURRENTLY_PLAYING: Track = {
  id: '1',
  title: 'Eclipse Protocol',
  artist: 'Sable Meridian',
  source: 'Navidrome',
  coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA0UY5fbImRPCBZLKmL0lRakdTdx4v6S1iZCLh4v1DBWpYrJhGaI_VRonZ4BK9-dMZS04vplVle7HFHq8pZ9UYRvGGeFmbOxkSBDtB4kgXQMKIq2WuJc__GY5MCh5vWyXbfR3ydtwi3bbV_RRVoCzQSWnyIDwgO-R6eCOpJ7vVB7N2zIjUDbtU8Y_phO5TZNPSXMRP0g7Ndosg0JweiLPeBpTBySmB93iJAL85bKreMur_-aayyGJN-omgUG5Gd8LHVMqvJtBdDJg'
};

export const RECENT_SEARCHES = ['Bon Iver', 'Tycho', 'Floating Points', 'Nils Frahm'];

export const LIBRARY_ITEMS: LibraryItem[] = [
  { id: '1', title: 'Liked Songs', subtitle: 'Playlist • 1,234 tracks', type: 'playlist' },
  { id: '2', title: 'Chill Vibes', subtitle: 'Playlist • 50 tracks', type: 'playlist', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4rOIauSFM3fAXooSlcH4YhFAQPuNwTjIjpEdOG_C4ZGbG3NHg0kDoYCcDUi15B2q5xTkUrpBl75m6sackiuopLhphIInEScBjmiKSgtddvps7zLT8Et2PAho4gzNYE4w5cOi1eVxGp5bsTQHaVyjfItROQOhZsjKA2tFov5Spe7B7EeBSBJ4J9UiXiVcg8HQR20bdqnDk7hUuZu17IsxVKJET-aFJDX0NYbVmcV_yBlYemHSPKnIvulqd9FN16J9d0T8VApjS5_A' },
  { id: '3', title: 'Focus Flow', subtitle: 'Playlist • 38 tracks', type: 'playlist', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADdaHni_zTb52vNPatxaw5Y-R9thih4lbhSvxAC6Ya5zgHaOmz0vlNuiN9eyeW9Gi3yXpG23fOhtZvsVBEI3dRXUWmObia-UDc8tnJPoRjRSMu-E9tAWjQM04Ot4ZsBO2SkSBacRSLXAUznfrHfweAmcC98qlHfE45gm76z4fBkpoRm-Wld_DCJtEWh01LXQocIIQ053lyD1yIx5shd7_UrAitX_zFBlVO6YS6d-bpN9Kezri8mtfPQ2uxghcjk5iD2_ZErlVP3o8' },
  { id: '4', title: 'Nils Frahm', subtitle: 'Artist', type: 'artist', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw' },
  { id: '5', title: 'The Earth is not a Cold Dead Place', subtitle: 'Album • Explosions in the Sky', type: 'album', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAplY2ydXOxqSkMOsVGexn_XtYeb5uGxVPkmV6cjDDDKTNnm4zgYYHZPx5D_cvUz9jwni3qwboJoXPJ6IzcNWlaQyhv8730p3pc45BWPP6qY1z5g__yMa_G9yrkC5TQLTluUHXDZq88ceEXNUBV-O6QHTUaKqlr4DotnlQPspPDCdAyHJbMeP2edJQVka4b2ndxx8n9Hnp2pVZi7QE-UGD4Di5zKnJ1itl0vDLScVvK4uhOg91wyXJHpqhxI3vO8Qgo3MBPt-GmrTs' },
  { id: '6', title: 'This Place Will Become Your Tomb', subtitle: 'Album • Sleep Token', type: 'album', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZLX1nkI3yP4tI3mCKilFSRMJhLgDHB3Z550VDWvQ6RG-a8L0btW07QmwM4coNKGS8XaP6Tqs1YraB5sU117reRPpMXpAS9KfznK-07NblMsWTfTeije22FugrR1_JMr6SofEr_BtG-KCF1XZY_9xHqe9I5WiV9iZyPfz513hJ-ZIMJoFb7bsQ1EsezNqLxP54jyLj_YCMUCbo3cI_DyAcfRSRpEPrSPmwWhYvLo9LzYbq54k-kXYJrBCKuq761aloAM8N4tkFsMc' },
  { id: '7', title: 'Discover Weekly', subtitle: 'Playlist • Made for you', type: 'playlist' }
];

export const ADDONS: AddOn[] = [
  // Source Add-ons
  {
    id: 'audius',
    name: 'Audius',
    description: 'Free, open music streaming. No account required.',
    icon: 'audius',
    isInstalled: false,
    type: 'source',
    color: 'text-purple-400',
  },
  { id: '1', name: 'Navidrome', description: 'Access your Navidrome server', icon: 'navidrome', isInstalled: true, isEnabled: true, type: 'source', color: 'text-brand-green' },
  { id: '2', name: 'Jellyfin', description: 'Stream from your Jellyfin server', icon: 'jellyfin', isInstalled: false, isEnabled: false, type: 'source', color: 'text-purple-500' },
  //{ id: 'youtube', name: 'YouTube Music', description: 'Stream any song via YouTube. No account required.', icon: 'youtube', isInstalled: false, isEnabled: false, type: 'source', color: 'text-red-600' },
  { id: '4', name: 'Radio Browser', description: 'Explore thousands of radio stations', icon: 'radio', isInstalled: false, isEnabled: false, type: 'source', color: 'text-cyan-400' },
  { id: '5', name: 'SoundCloud', description: 'Search and play SoundCloud tracks', icon: 'soundcloud', isInstalled: false, isEnabled: false, type: 'source', color: 'text-orange-500' },
  // Tool Add-ons
  { id: '6', name: 'Last.fm', description: 'Scrobble and discover with Last.fm', icon: 'lastfm', isInstalled: false, isEnabled: false, type: 'tool', color: 'text-red-600' },
  // Theme Add-ons (Visual changes)
  { id: 'theme-oled', name: 'OLED Black Theme', description: 'Ultra-dark pure black UI theme for OLED displays', icon: 'palette', isInstalled: true, isEnabled: true, type: 'theme', color: 'text-neutral-200' },
  { id: 'theme-cosmic', name: 'Cosmic Nebula Theme', description: 'Galactic dark purple theme with stellar accents', icon: 'palette', isInstalled: true, isEnabled: true, type: 'theme', color: 'text-indigo-400' },
  { id: 'theme-obsidian', name: 'Obsidian Theme', description: 'Volcanic glass sleek gray theme layout', icon: 'palette', isInstalled: true, isEnabled: true, type: 'theme', color: 'text-slate-400' }
];

export const TEST_TRACK: Track = {
  id: 'test-1',
  title: 'Test Audio',
  artist: 'Aether',
  source: 'Local',
  coverUrl: 'https://picsum.photos/300',
  // Free public domain MP3 — just for testing
  streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
};
