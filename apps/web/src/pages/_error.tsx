import type { NextPageContext } from "next";

interface ErrorProps {
	statusCode?: number;
	hasGetInitialProps?: boolean;
}

function Error({ statusCode }: ErrorProps) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				fontFamily: "system-ui, sans-serif",
			}}
		>
			<h1>{statusCode ? `Server error ${statusCode}` : "Client error"}</h1>
			<p>Sorry, something went wrong.</p>
		</div>
	);
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
	const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
	return { statusCode };
};

export default Error;
