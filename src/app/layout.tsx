import '@/styles/globals.sass';


export const metadata = {
	title: 'Portfolio',
	description: 'Douglas\' Portfolio',
	viewport: 'width=device-width, initial-scale=1.0, interactive-widget=resizes-content'
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en-us'>
			<body>{children}</body>
		</html>
	);
}
