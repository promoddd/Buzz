export const THEME_COLORS = {
  DEFAULT_TITLE_COLOR: '#646cff',
  THEME_GRAY: 'hsl(240 10% 3.9%)', // Dark theme gray from the site
};

export const isValidColor = (color: string) => {
  const invalidColors = ['#000000', '#ffffff', '#fff', '#000'];
  return !invalidColors.includes(color.toLowerCase());
};