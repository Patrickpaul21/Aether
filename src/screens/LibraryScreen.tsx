import { Plus, ListFilter, Search, Grid2X2, Heart, ArrowUpRight, ArrowLeft, Play, Pause, Clock, Music, Disc, User, Info, Calendar, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LIBRARY_ITEMS } from '../constants';
import { Track, LibraryItem } from '../types';

// Mock comprehensive library tracks matching track asset architecture
const MOCK_LIBRARY_TRACKS: Record<string, Track[]> = {
  // Liked Songs
  '1': [
    { id: 'lib-t1', title: 'Eclipse Protocol', artist: 'Sable Meridian', source: 'Navidrome', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA0UY5fbImRPCBZLKmL0lRakdTdx4v6S1iZCLh4v1DBWpYrJhGaI_VRonZ4BK9-dMZS04vplVle7HFHq8pZ9UYRvGGeFmbOxkSBDtB4kgXQMKIq2WuJc__GY5MCh5vWyXbfR3ydtwi3bbV_RRVoCzQSWnyIDwgO-R6eCOpJ7vVB7N2zIjUDbtU8Y_phO5TZNPSXMRP0g7Ndosg0JweiLPeBpTBySmB93iJAL85bKreMur_-aayyGJN-omgUG5Gd8LHVMqvJtBdDJg', duration: '5:47', isLiked: true },
    { id: 'lib-t2', title: 'Midnight Loops', artist: 'Hotel Pools', source: 'Navidrome', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPkUw1oiRwmVDSu0pacXlYSX7oWsDs5qZR3D56i0vUajj7UquKLd1ygsD_5awKGWAHCh90R07m00n4O3h_ZhSodPZJj89ZSTY7bV69qAPXM65RFBR9jWE8_96Cg2dvgNkyev7LarJ-644ypulT8Q53dZZaKdBOZKhmlzCiaf66ivSEOB-W-KREP6LGhCnR-qMA9aL0lDNCJ_Y3uwTE7EIe16s2Tzs7Uylz3oK1Bc3xMsP0BT4nF1jAy4L1c76IRSJTV5yNFxtNnrE', duration: '3:12', isLiked: true },
    { id: 'lib-t3', title: 'Says', artist: 'Nils Frahm', source: 'Local Library', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw', duration: '8:18', isLiked: true },
    { id: 'lib-t4', title: 'The Summoning', artist: 'Sleep Token', source: 'Jellyfin', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZLX1nkI3yP4tI3mCKilFSRMJhLgDHB3Z550VDWvQ6RG-a8L0btW07QmwM4coNKGS8XaP6Tqs1YraB5sU117reRPpMXpAS9KfznK-07NblMsWTfTeije22FugrR1_JMr6SofEr_BtG-KCF1XZY_9xHqe9I5WiV9iZyPfz513hJ-ZIMJoFb7bsQ1EsezNqLxP54jyLj_YCMUCbo3cI_DyAcfRSRpEPrSPmwWhYvLo9LzYbq54k-kXYJrBCKuq761aloAM8N4tkFsMc', duration: '6:35', isLiked: true }
  ],
  // Chill Vibes
  '2': [
    { id: 'lib-t2', title: 'Midnight Loops', artist: 'Hotel Pools', source: 'Navidrome', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPkUw1oiRwmVDSu0pacXlYSX7oWsDs5qZR3D56i0vUajj7UquKLd1ygsD_5awKGWAHCh90R07m00n4O3h_ZhSodPZJj89ZSTY7bV69qAPXM65RFBR9jWE8_96Cg2dvgNkyev7LarJ-644ypulT8Q53dZZaKdBOZKhmlzCiaf66ivSEOB-W-KREP6LGhCnR-qMA9aL0lDNCJ_Y3uwTE7EIe16s2Tzs7Uylz3oK1Bc3xMsP0BT4nF1jAy4L1c76IRSJTV5yNFxtNnrE', duration: '3:12', isLiked: true },
    { id: 'lib-t5', title: 'Oskar', artist: 'Kiasmos', source: 'SoundCloud', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-0DXWyUVRsl5AKr-RllJwjTyMU6bPhXvQMD8MnB49VOgldYItLpBpryeMnqwYOi6G29X4OGwwY0SvzvAdN9VgFpbHpOKJXANumBZM8axGAEGn9DbGc6Q1PPAE1dNKk4tnkUsxoWfGWT-Vd0zjQAZhAfaxQuy4NOQ8-HFj-zDyIHTcFAUlBLNLE7OnrhJ1GEZ3mAqaPhIRNKct9kAemuSibuJJCsILCE11Do2ErU0qKz0Puba5cUxA4tnSsnC2bmnVaYdnMFrsXw4', duration: '5:12', isLiked: false },
    { id: 'lib-t6', title: 'Awake', artist: 'Tycho', source: 'Radio Browser', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPkUw1oiRwmVDSu0pacXlYSX7oWsDs5qZR3D56i0vUajj7UquKLd1ygsD_5awKGWAHCh90R07m00n4O3h_ZhSodPZJj89ZSTY7bV69qAPXM65RFBR9jWE8_96Cg2dvgNkyev7LarJ-644ypulT8Q53dZZaKdBOZKhmlzCiaf66ivSEOB-W-KREP6LGhCnR-qMA9aL0lDNCJ_Y3uwTE7EIe16s2Tzs7Uylz3oK1Bc3xMsP0BT4nF1jAy4L1c76IRSJTV5yNFxtNnrE', duration: '4:43', isLiked: false }
  ],
  // Focus Flow
  '3': [
    { id: 'lib-t7', title: 'Fragments', artist: 'Kiasmos', source: 'Navidrome', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-0DXWyUVRsl5AKr-RllJwjTyMU6bPhXvQMD8MnB49VOgldYItLpBpryeMnqwYOi6G29X4OGwwY0SvzvAdN9VgFpbHpOKJXANumBZM8axGAEGn9DbGc6Q1PPAE1dNKk4tnkUsxoWfGWT-Vd0zjQAZhAfaxQuy4NOQ8-HFj-zDyIHTcFAUlBLNLE7OnrhJ1GEZ3mAqaPhIRNKct9kAemuSibuJJCsILCE11Do2ErU0qKz0Puba5cUxA4tnSsnC2bmnVaYdnMFrsXw4', duration: '4:25', isLiked: true },
    { id: 'lib-t8', title: 'Overfire', artist: 'Tycho', source: 'Navidrome', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB56_-R-i7Xog3FUWpXGbKNYiEXANnuw7E0ibiKRea3cACfa49opRk8FuzK-8blV-UgH-zdaGjq6clxyORH3159U6QmIc8ShWd---BD1kG3A_FjTjgP-_KsjJzW4SPwhJqhI8vhjCieeZh4y67_tIf6QhWRgCbcdPwTG2g-yDE5NRVFA7aqW67AwJWGeyJlNpBMNYTEPotBeBkg3yyU-m3m7HViNhDxyHcXLkINkSPaWVxZkUaEEn-vScmO7bB95ujKv5hiXBpLBWg', duration: '4:01', isLiked: false },
    { id: 'lib-t3', title: 'Says', artist: 'Nils Frahm', source: 'Local Library', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw', duration: '8:18', isLiked: true }
  ],
  // Discover Weekly
  '7': [
    { id: 'lib-t9', title: 'Sunrise Horizon', artist: 'Sable Meridian', source: 'Navidrome', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA0UY5fbImRPCBZLKmL0lRakdTdx4v6S1iZCLh4v1DBWpYrJhGaI_VRonZ4BK9-dMZS04vplVle7HFHq8pZ9UYRvGGeFmbOxkSBDtB4kgXQMKIq2WuJc__GY5MCh5vWyXbfR3ydtwi3bbV_RRVoCzQSWnyIDwgO-R6eCOpJ7vVB7N2zIjUDbtU8Y_phO5TZNPSXMRP0g7Ndosg0JweiLPeBpTBySmB93iJAL85bKreMur_-aayyGJN-omgUG5Gd8LHVMqvJtBdDJg', duration: '5:10', isLiked: false },
    { id: 'lib-t7', title: 'Fragments', artist: 'Kiasmos', source: 'Navidrome', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-0DXWyUVRsl5AKr-RllJwjTyMU6bPhXvQMD8MnB49VOgldYItLpBpryeMnqwYOi6G29X4OGwwY0SvzvAdN9VgFpbHpOKJXANumBZM8axGAEGn9DbGc6Q1PPAE1dNKk4tnkUsxoWfGWT-Vd0zjQAZhAfaxQuy4NOQ8-HFj-zDyIHTcFAUlBLNLE7OnrhJ1GEZ3mAqaPhIRNKct9kAemuSibuJJCsILCE11Do2ErU0qKz0Puba5cUxA4tnSsnC2bmnVaYdnMFrsXw4', duration: '4:25', isLiked: true },
    { id: 'lib-t6', title: 'Awake', artist: 'Tycho', source: 'Radio Browser', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPkUw1oiRwmVDSu0pacXlYSX7oWsDs5qZR3D56i0vUajj7UquKLd1ygsD_5awKGWAHCh90R07m00n4O3h_ZhSodPZJj89ZSTY7bV69qAPXM65RFBR9jWE8_96Cg2dvgNkyev7LarJ-644ypulT8Q53dZZaKdBOZKhmlzCiaf66ivSEOB-W-KREP6LGhCnR-qMA9aL0lDNCJ_Y3uwTE7EIe16s2Tzs7Uylz3oK1Bc3xMsP0BT4nF1jAy4L1c76IRSJTV5yNFxtNnrE', duration: '4:43', isLiked: false }
  ],
  // Albums list tracks
  // The Earth is not a Cold Dead Place
  '5': [
    { id: 'lib-t10', title: 'First Breath After Coma', artist: 'Explosions in the Sky', source: 'Local Library', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAplY2ydXOxqSkMOsVGexn_XtYeb5uGxVPkmV6cjDDDKTNnm4zgYYHZPx5D_cvUz9jwni3qwboJoXPJ6IzcNWlaQyhv8730p3pc45BWPP6qY1z5g__yMa_G9yrkC5TQLTluUHXDZq88ceEXNUBV-O6QHTUaKqlr4DotnlQPspPDCdAyHJbMeP2edJQVka4b2ndxx8n9Hnp2pVZi7QE-UGD4Di5zKnJ1itl0vDLScVvK4uhOg91wyXJHpqhxI3vO8Qgo3MBPt-GmrTs', duration: '9:33', isLiked: false },
    { id: 'lib-t11', title: 'The Only Moment We Were Alone', artist: 'Explosions in the Sky', source: 'Local Library', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAplY2ydXOxqSkMOsVGexn_XtYeb5uGxVPkmV6cjDDDKTNnm4zgYYHZPx5D_cvUz9jwni3qwboJoXPJ6IzcNWlaQyhv8730p3pc45BWPP6qY1z5g__yMa_G9yrkC5TQLTluUHXDZq88ceEXNUBV-O6QHTUaKqlr4DotnlQPspPDCdAyHJbMeP2edJQVka4b2ndxx8n9Hnp2pVZi7QE-UGD4Di5zKnJ1itl0vDLScVvK4uhOg91wyXJHpqhxI3vO8Qgo3MBPt-GmrTs', duration: '10:14', isLiked: true },
    { id: 'lib-t12', title: 'Six Days at the Bottom of the Ocean', artist: 'Explosions in the Sky', source: 'Local Library', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAplY2ydXOxqSkMOsVGexn_XtYeb5uGxVPkmV6cjDDDKTNnm4zgYYHZPx5D_cvUz9jwni3qwboJoXPJ6IzcNWlaQyhv8730p3pc45BWPP6qY1z5g__yMa_G9yrkC5TQLTluUHXDZq88ceEXNUBV-O6QHTUaKqlr4DotnlQPspPDCdAyHJbMeP2edJQVka4b2ndxx8n9Hnp2pVZi7QE-UGD4Di5zKnJ1itl0vDLScVvK4uhOg91wyXJHpqhxI3vO8Qgo3MBPt-GmrTs', duration: '8:43', isLiked: false }
  ],
  // This Place Will Become Your Tomb
  '6': [
    { id: 'lib-t4', title: 'The Summoning', artist: 'Sleep Token', source: 'Jellyfin', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZLX1nkI3yP4tI3mCKilFSRMJhLgDHB3Z550VDWvQ6RG-a8L0btW07QmwM4coNKGS8XaP6Tqs1YraB5sU117reRPpMXpAS9KfznK-07NblMsWTfTeije22FugrR1_JMr6SofEr_BtG-KCF1XZY_9xHqe9I5WiV9iZyPfz513hJ-ZIMJoFb7bsQ1EsezNqLxP54jyLj_YCMUCbo3cI_DyAcfRSRpEPrSPmwWhYvLo9LzYbq54k-kXYJrBCKuq761aloAM8N4tkFsMc', duration: '6:35', isLiked: true },
    { id: 'lib-t13', title: 'Chokehold', artist: 'Sleep Token', source: 'Jellyfin', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZLX1nkI3yP4tI3mCKilFSRMJhLgDHB3Z550VDWvQ6RG-a8L0btW07QmwM4coNKGS8XaP6Tqs1YraB5sU117reRPpMXpAS9KfznK-07NblMsWTfTeije22FugrR1_JMr6SofEr_BtG-KCF1XZY_9xHqe9I5WiV9iZyPfz513hJ-ZIMJoFb7bsQ1EsezNqLxP54jyLj_YCMUCbo3cI_DyAcfRSRpEPrSPmwWhYvLo9LzYbq54k-kXYJrBCKuq761aloAM8N4tkFsMc', duration: '5:04', isLiked: false },
    { id: 'lib-t14', title: 'Alkaline', artist: 'Sleep Token', source: 'Jellyfin', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZLX1nkI3yP4tI3mCKilFSRMJhLgDHB3Z550VDWvQ6RG-a8L0btW07QmwM4coNKGS8XaP6Tqs1YraB5sU117reRPpMXpAS9KfznK-07NblMsWTfTeije22FugrR1_JMr6SofEr_BtG-KCF1XZY_9xHqe9I5WiV9iZyPfz513hJ-ZIMJoFb7bsQ1EsezNqLxP54jyLj_YCMUCbo3cI_DyAcfRSRpEPrSPmwWhYvLo9LzYbq54k-kXYJrBCKuq761aloAM8N4tkFsMc', duration: '3:34', isLiked: true }
  ]
};

// Mock comprehensive artist databases
interface ArtistDetail {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  monthlyListeners: string;
  followers: string;
  verified: boolean;
  popularTracks: Track[];
  discography: { title: string; year: string; type: string; imageUrl: string }[];
}

const MOCK_ARTIST_DETAILS: Record<string, ArtistDetail> = {
  '4': {
    id: '4',
    name: 'Nils Frahm',
    verified: true,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw',
    bio: 'German composer, producer, and celebrated pianist known for combining classical and electronic music with an unconventional, felt-damped keyboard approach.',
    monthlyListeners: '2,481,254 monthly listeners',
    followers: '984K followers',
    popularTracks: [
      { id: 'lib-t3', title: 'Says', artist: 'Nils Frahm', source: 'Local Library', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw', duration: '8:18' },
      { id: 'lib-art-f1', title: 'Ambre', artist: 'Nils Frahm', source: 'Local Library', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw', duration: '3:48' },
      { id: 'lib-art-f2', title: 'Toilet Brushes - More', artist: 'Nils Frahm', source: 'Local Library', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw', duration: '14:24' }
    ],
    discography: [
      { title: 'All Melody', year: '2018', type: 'Album', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw' },
      { title: 'Spaces', year: '2013', type: 'Album', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw' },
      { title: 'Felt', year: '2011', type: 'Album', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-YtvhT7ROnJYzX-RjblWdCM0Sa4RO8S58LymIiYCo0aQIxiPcIGcN_kKDbIsQCrhlyqV4breOatYjK5J3q9LkPPtqLz9NYiTH5ifpyYpRQwP8EGyrGCLWjERfabr_yzS-ThRxndJWJ8XhKzYE9benLC3-zV9BoKKTM6wr-Oil49i8Iaq-2DO9nqxJX9f6xXtENWrgURqW5p0XzBesBmAoEC6lTbvEHDlWKDBYxvdI_sNiJeVNy630wLvjLeROOIa7VyaJQTn9vPw' }
    ]
  }
};

interface LibraryScreenProps {
  onPlayTrack?: (track: Track) => void;
}

export default function LibraryScreen({ onPlayTrack }: LibraryScreenProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Playlists' | 'Albums' | 'Artists'>('All');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const handleOpenItem = (item: LibraryItem) => {
    setSelectedItem(item);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  // Filter logic
  const filteredItems = LIBRARY_ITEMS.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Playlists') return item.type === 'playlist';
    if (activeFilter === 'Albums') return item.type === 'album';
    if (activeFilter === 'Artists') return item.type === 'artist';
    return true;
  });

  return (
    <div className="flex flex-col relative h-full">
      <AnimatePresence mode="popLayout">
        {/* VIEW 1: MAIN LIBRARY LIST */}
        {!selectedItem && (
          <motion.div
            key="library-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            <header className="sticky top-0 bg-brand-dark/95 backdrop-blur-md z-50 px-4 pt-5 pb-2">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                     <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkpx1_ktMSVq9H5eIqAJqGGgd7Gy2v9w2jvdEEHu38XOIBi0ikPe8GpSZ-m93TwvFeJUzYSLesGIckfvNsfthcgpt-7Ij-fUKvFGxQmRcKa1odZAdc73RhEFyIyvklxl1TlMwdgnIgHNd8IZYfB5LFcXyCRQsszMU6ag_mE6AMTcuYJvCaARVH4u5nXm8namgE8tz21MZq4Of4jo3yBuPPD4JJ_-9aMdbemD_gkZhOACaatAiDCe37Q7hkQ2ohJ8mq1eBQjQruGqo" alt="User" />
                  </div>
                  <h1 className="text-2xl font-bold">Your Library</h1>
                </div>
                <button className="p-2 text-white hover:text-brand-green">
                  <Plus size={24} />
                </button>
              </div>

              {/* Segment Filters */}
              <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-2">
                {['All', 'Playlists', 'Albums', 'Artists'].map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeFilter === filter ? 'bg-brand-green text-black' : 'bg-brand-card text-white border border-white/10'}`}
                  >
                    {filter}
                  </button>
                ))}
              </nav>
            </header>

            <main className="px-4 pb-36 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between py-4 px-2">
                <button className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white">
                  <ListFilter size={16} />
                  <span>Recents</span>
                </button>
                <div className="flex items-center gap-4 text-gray-400">
                  <button><Search size={20} /></button>
                  <button><Grid2X2 size={20} /></button>
                </div>
              </div>

              <div id="library-list-container" className="space-y-3">
                {filteredItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleOpenItem(item)}
                    className={`flex items-center gap-4 group p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                      index === 0 
                        ? 'bg-zinc-800/40 hover:bg-zinc-800/70 border border-brand-green/20 hover:border-brand-green/40 shadow-md shadow-brand-green/5' 
                        : 'bg-transparent hover:bg-zinc-900/40 border border-transparent'
                    }`}
                  >
                    <div className="w-14 h-14 flex-shrink-0 bg-brand-card rounded-lg flex items-center justify-center shadow-md overflow-hidden relative group-hover:scale-105 transition-transform">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${item.title === 'Liked Songs' ? 'bg-gradient-to-br from-indigo-700 to-blue-300' : 'bg-gradient-to-tr from-purple-800 to-cyan-500'}`}>
                          {item.title === 'Liked Songs' ? <Heart size={24} fill="white" /> : <span className="text-[10px] font-bold text-black/60">DISCOVER</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold truncate text-sm transition-colors ${item.title === 'Liked Songs' ? 'text-brand-green group-hover:text-brand-green/90' : 'text-white group-hover:text-brand-green'}`}>{item.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        {item.title === 'Liked Songs' && <ArrowUpRight size={12} className="text-brand-green animate-pulse" />}
                        <span>{item.subtitle}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </motion.div>
        )}

        {/* VIEW 2: PLAYLIST / ALBUM DETAILS (type === 'playlist' OR 'album') */}
        {selectedItem && (selectedItem.type === 'playlist' || selectedItem.type === 'album') && (
          <motion.div
            key="library-playlist-detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex flex-col h-full absolute inset-0 bg-brand-dark z-50 overflow-hidden"
          >
            {/* Header Cover Banner */}
            <div className="relative h-52 flex-shrink-0 flex flex-col justify-end p-6 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-black/60">
              <button 
                onClick={handleCloseDetail}
                className="absolute top-5 left-6 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-zinc-800 transition-colors z-55"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                {selectedItem.imageUrl ? (
                  <img src={selectedItem.imageUrl} className="w-full h-full object-cover filter blur-md" alt="" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-black filter blur-md" />
                )}
              </div>

              <div className="relative z-10 flex gap-4 items-end">
                {selectedItem.imageUrl ? (
                  <img 
                    src={selectedItem.imageUrl} 
                    alt={selectedItem.title} 
                    className="w-24 h-24 rounded-lg object-cover shadow-2xl border border-white/10" 
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-lg flex items-center justify-center shadow-2xl border border-white/10 ${selectedItem.title === 'Liked Songs' ? 'bg-gradient-to-br from-indigo-700 to-blue-300' : 'bg-gradient-to-tr from-purple-800 to-cyan-500'}`}>
                    {selectedItem.title === 'Liked Songs' ? <Heart size={36} fill="white" /> : <Music size={36} />}
                  </div>
                )}
                <div className="min-w-0 pb-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-green/20 text-brand-green font-bold uppercase tracking-widest">
                    {selectedItem.type}
                  </span>
                  <h1 className="text-xl font-black text-white mt-1.5 leading-tight truncate">{selectedItem.title}</h1>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{selectedItem.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Controls segment */}
            <div className="flex items-center justify-between px-6 py-3 border-y border-brand-border bg-brand-dark/50 backdrop-blur">
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                {(MOCK_LIBRARY_TRACKS[selectedItem.id] || []).length} items curated
              </span>
              <button 
                onClick={() => {
                  const tracks = MOCK_LIBRARY_TRACKS[selectedItem.id] || [];
                  if (tracks.length > 0 && onPlayTrack) {
                    onPlayTrack(tracks[0]);
                  }
                }}
                className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <Play size={18} fill="currentColor" className="ml-0.5" />
              </button>
            </div>

            {/* List of tracks inside the playlist/album */}
            <main className="flex-1 overflow-y-auto px-6 pt-4 pb-36 no-scrollbar">
              <div id="library-track-list" className="space-y-1">
                {(MOCK_LIBRARY_TRACKS[selectedItem.id] || []).length === 0 ? (
                  <div className="text-center text-zinc-500 py-12">
                    <Music size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No local tracks cached within this mock item.</p>
                  </div>
                ) : (
                  (MOCK_LIBRARY_TRACKS[selectedItem.id] || []).map((track, idx) => (
                    <div 
                      key={`${track.id}-${idx}`}
                      onClick={() => onPlayTrack && onPlayTrack(track)}
                      className="flex items-center gap-4 p-2.5 rounded-lg bg-zinc-900/10 hover:bg-zinc-900/50 border border-transparent hover:border-white/5 cursor-pointer group transition-all"
                    >
                      <span className="w-4 text-xs font-mono text-zinc-500 text-center group-hover:text-brand-green">
                        {idx + 1}
                      </span>
                      <img src={track.coverUrl} className="w-10 h-10 rounded object-cover shadow" alt="" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-brand-green transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
                      </div>
                      {track.duration && (
                        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                          <Clock size={10} />
                          {track.duration}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </main>
          </motion.div>
        )}

        {/* VIEW 3: ARTIST DETAILS (type === 'artist') */}
        {selectedItem && selectedItem.type === 'artist' && (
          <motion.div
            key="library-artist-detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex flex-col h-full absolute inset-0 bg-brand-dark z-50 overflow-hidden"
          >
            {/* Header Artist Banner */}
            <div className="relative h-56 flex-shrink-0 flex flex-col justify-end p-6 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-black/70">
              <button 
                onClick={handleCloseDetail}
                className="absolute top-5 left-6 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-zinc-800 transition-colors z-55"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="absolute inset-0 z-0 pointer-events-none">
                {selectedItem.imageUrl ? (
                  <img src={selectedItem.imageUrl} className="w-full h-full object-cover filter brightness-[0.6]" alt="" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-teal-900 to-black" />
                )}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={11} className="text-brand-green" />
                  <span className="text-[9px] text-brand-green font-bold uppercase tracking-wider">Verified Artist</span>
                </div>
                <h1 className="text-3xl font-black text-white leading-none tracking-tight">{selectedItem.title}</h1>
                <p className="text-xs text-zinc-300 mt-2 font-medium">
                  {MOCK_ARTIST_DETAILS[selectedItem.id]?.monthlyListeners || '1,124,500 monthly listeners'}
                </p>
              </div>
            </div>

            {/* Controls banner */}
            <div className="flex items-center justify-between px-6 py-3 border-y border-brand-border bg-brand-dark/50 backdrop-blur">
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                {MOCK_ARTIST_DETAILS[selectedItem.id]?.followers || '500K followers'}
              </span>
              <button 
                onClick={() => {
                  const artistDetail = MOCK_ARTIST_DETAILS[selectedItem.id];
                  if (artistDetail?.popularTracks?.length && onPlayTrack) {
                    onPlayTrack(artistDetail.popularTracks[0]);
                  }
                }}
                className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <Play size={18} fill="currentColor" className="ml-0.5" />
              </button>
            </div>

            {/* Artist Rich Details Body */}
            <main className="flex-1 overflow-y-auto px-6 pt-4 pb-36 no-scrollbar space-y-6">
              {/* Profile / Bio */}
              <div className="p-4 rounded-xl bg-brand-card/30 border border-white/5">
                <h3 className="text-xs font-bold uppercase text-brand-green tracking-wider mb-2 flex items-center gap-1.5">
                  <Info size={12} /> Artist Bio
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {MOCK_ARTIST_DETAILS[selectedItem.id]?.bio || 'A leading figure in contemporary ambient and minimal music, touring internationally with custom acoustic-electric setups.'}
                </p>
              </div>

              {/* Popular Tracks */}
              <div>
                <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-3">Popular Tracks</h3>
                <div id="artist-popular-tracks" className="space-y-1">
                  {(MOCK_ARTIST_DETAILS[selectedItem.id]?.popularTracks || [
                    { id: 'lib-fallback-t1', title: 'Says', artist: selectedItem.title, source: 'Local Library', coverUrl: selectedItem.imageUrl || '', duration: '8:18' }
                  ]).map((track, idx) => (
                    <div 
                      key={track.id}
                      onClick={() => onPlayTrack && onPlayTrack(track)}
                      className="flex items-center gap-4 p-2 rounded-lg bg-zinc-900/10 hover:bg-zinc-900/50 border border-transparent hover:border-white/5 cursor-pointer group transition-all"
                    >
                      <span className="w-4 text-xs font-mono text-zinc-500 text-center group-hover:text-brand-green">
                        {idx + 1}
                      </span>
                      <img src={track.coverUrl} className="w-10 h-10 rounded object-cover shadow" alt="" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-brand-green transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 truncate">Popularity High</p>
                      </div>
                      {track.duration && (
                        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                          <Clock size={10} />
                          {track.duration}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Discography */}
              <div>
                <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-3 flex items-center gap-1.5">
                  <Disc size={13} /> Albums & Releases
                </h3>
                <div id="artist-discography" className="grid grid-cols-2 gap-3 pb-8">
                  {(MOCK_ARTIST_DETAILS[selectedItem.id]?.discography || [
                    { title: 'All Melody', year: '2018', type: 'Album', imageUrl: selectedItem.imageUrl || '' },
                    { title: 'Spaces', year: '2013', type: 'Album', imageUrl: selectedItem.imageUrl || '' }
                  ]).map((album, idx) => (
                    <div 
                      key={idx}
                      className="bg-brand-card/20 hover:bg-brand-card/50 border border-white/5 rounded-xl p-3 flex flex-col cursor-pointer transition-colors"
                      onClick={() => {
                        // Play matching style tracks or ambient loop
                        if (onPlayTrack) {
                          onPlayTrack({
                            id: `disc-${idx}`,
                            title: album.title,
                            artist: selectedItem.title,
                            source: 'Discography',
                            coverUrl: album.imageUrl,
                            duration: 'EP'
                          });
                        }
                      }}
                    >
                      <img src={album.imageUrl} className="w-full aspect-square rounded-lg object-cover shadow mb-2" alt="" />
                      <h4 className="text-xs font-bold text-white truncate">{album.title}</h4>
                      <p className="text-[9px] text-zinc-400 mt-0.5 flex items-center gap-1">
                        <Calendar size={10} />
                        {album.type} • {album.year}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
