import '@/styles/globals.sass';

export const metadata = {
	title: 'Portfolio',
	description: 'Douglas\' Portfolio'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en-us'>
			<body>{children}</body>
		</html>
	);
}
