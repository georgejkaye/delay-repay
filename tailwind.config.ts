import type { Config } from "tailwindcss"

const buffer = 50
const minDesktopSize = 1000
const minTabletSize = 600
const contentSize = minDesktopSize - buffer
const tabletContentSize = minTabletSize - buffer
const mobileContentSize = 350

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      desktop: `${minDesktopSize}px`,
      tablet: `${minTabletSize}px`,
    },
    extend: {
      width: {
        content: `${contentSize}px`,
        tabletContent: `${tabletContentSize}px`,
        mobileContent: `${mobileContentSize}px`,
      },
      colors: {
        bg: "#f7f7f7",
        fg: "#4c4c4c",
        bg2: "#605270",
        fg2: "#ffffff",
      },
    },
  },
  plugins: [],
}
export default config
