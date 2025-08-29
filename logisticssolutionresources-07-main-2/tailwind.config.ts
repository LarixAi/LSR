
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			screens: {
				'xs': '375px',
				'mobile': { 'max': '767px' },
				'tablet': { 'min': '768px', 'max': '1023px' },
				'desktop': { 'min': '1024px' }
			},
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				brand: {
					DEFAULT: 'hsl(var(--brand))',
					foreground: 'hsl(var(--brand-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-bg))',
					bg: 'hsl(var(--sidebar-bg))',
					'bg-hover': 'hsl(var(--sidebar-bg-hover))',
					border: 'hsl(var(--sidebar-border))',
					text: 'hsl(var(--sidebar-text))',
					'text-muted': 'hsl(var(--sidebar-text-muted))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				transport: {
					blue: 'hsl(0, 0%, 20%)',
					'blue-light': 'hsl(0, 0%, 40%)',
					green: 'hsl(0, 0%, 35%)',
					orange: 'hsl(0, 0%, 30%)',
					gray: 'hsl(0, 0%, 47%)',
				},
				// Monochrome overrides for default Tailwind color utilities
				gray: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				slate: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				zinc: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				neutral: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				stone: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				blue: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				green: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				red: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				yellow: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				indigo: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				purple: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				orange: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				teal: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				cyan: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				pink: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				sky: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				emerald: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				rose: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				amber: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				lime: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
				violet: { 50:'hsl(0,0%,98%)',100:'hsl(0,0%,95%)',200:'hsl(0,0%,90%)',300:'hsl(0,0%,85%)',400:'hsl(0,0%,70%)',500:'hsl(0,0%,55%)',600:'hsl(0,0%,40%)',700:'hsl(0,0%,25%)',800:'hsl(0,0%,15%)',900:'hsl(0,0%,10%)' },
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					from: {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					to: {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'slide-in': {
					from: {
						transform: 'translateX(-100%)'
					},
					to: {
						transform: 'translateX(0)'
					}
				},
				'draw': {
					'0%': { 'stroke-dasharray': '0 1000' },
					'50%': { 'stroke-dasharray': '100 1000' },
					'100%': { 'stroke-dasharray': '0 1000' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'blob': {
					'0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
					'33%': { transform: 'translate(30px, -50px) scale(1.1)' },
					'66%': { transform: 'translate(-20px, 20px) scale(0.9)' }
				},
				'slideUp': {
					from: {
						opacity: '0',
						transform: 'translateY(30px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'shimmer': {
					'0%, 100%': { 'background-position': '0% 50%' },
					'50%': { 'background-position': '100% 50%' }
				},
				'glow': {
					'0%, 100%': { 'box-shadow': '0 0 20px hsl(var(--primary) / 0.5)' },
					'50%': { 'box-shadow': '0 0 30px hsl(var(--primary) / 0.7)' }
				},
				'fadeIn': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'float-slow': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'float-medium': {
					'0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
					'50%': { transform: 'translateY(-15px) translateX(5px)' }
				},
				'gentle-bounce': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-8px)' }
				},
				'gentle-pulse': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.8', transform: 'scale(1.05)' }
				},
				'ai-bounce': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'25%': { transform: 'translateY(-6px) rotate(-1deg)' },
					'50%': { transform: 'translateY(-10px) rotate(0deg)' },
					'75%': { transform: 'translateY(-6px) rotate(1deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'draw': 'draw 4s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'blob': 'blob 7s infinite',
				'slideUp': 'slideUp 1s ease-out',
				'shimmer': 'shimmer 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'fadeIn': 'fadeIn 1s ease-out',
				'float-slow': 'float-slow 4s ease-in-out infinite',
				'float-medium': 'float-medium 3s ease-in-out infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'gentle-bounce': 'gentle-bounce 2s ease-in-out infinite',
				'gentle-pulse': 'gentle-pulse 2s ease-in-out infinite',
				'ai-bounce': 'ai-bounce 3s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
