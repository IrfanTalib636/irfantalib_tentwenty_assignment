export const TABS = {
    DASHBOARD: 'Dashboard',
    WATCH: 'Watch',
    MEDIA_LIBRARY: 'MediaLibrary',
    MORE: 'More',
} as const

const SCREEN_NAMES = {
    HOME: 'Home',
    MOVIE_DETAILS: 'MovieDetails',
    SEARCH: 'Search',
    WATCHLIST: 'Watchlist',
    FAVORITES: 'Favorites',
    PROFILE: 'Profile',
}

export const COLORS = {
    DARK: 'rgba(46,39,57,1)',
    DARK_FAINT: 'rgba(46,39,57,0.12)',
    WHITE: 'rgba(246,246,250,1)',
    PURE_WHITE: '#FFFFFF',
    BLACK: '#000000',
    TRANSPARENT: 'transparent',
    GREY: 'rgba(130,125,136,1)',
    BLUE: 'rgba(97,195,242,1)',
    BLUE_FAINT: 'rgba(97,195,242,0.35)',
    LIGHT_GREY: 'rgba(219,219,223,1)',
    LIGHT_GREY_FADE: 'rgba(219,219,223,0)',
    SEAT_GREY: '#E6E6EB',
    SURFACE: '#EFEFEF',
    CHIP: '#E8E8EE',
    UNAVAILABLE: '#C5C5CB',
    SCRIM: 'rgba(0,0,0,0.45)',
    TEAL: 'rgba(21,210,188,1)',
    PINK: 'rgba(226,108,165,1)',
    PURPLE: 'rgba(86,76,163,1)',
    YELLOW: 'rgba(205,157,15,1)',
}

export const GRADIENTS = {
    HERO_TOP: ['rgba(0,0,0,0.82)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0)'],
    HERO_BOTTOM: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)'],
    CARD: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.72)'],
    GENRE: ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.72)'],
} as const

export default SCREEN_NAMES;