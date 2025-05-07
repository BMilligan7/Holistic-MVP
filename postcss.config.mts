// Define a basic type for the config structure
interface PostCSSConfig {
  plugins: {
    [key: string]: object; // Allow any plugin name with an object value
  };
}

const config: PostCSSConfig = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config; 