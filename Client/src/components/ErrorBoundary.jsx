import { Component } from "react";

class ErrorBoundary extends Component {
	state = { error: null };

	static getDerivedStateFromError(error) {
		return { error };
	}

	render() {
		if (this.state.error) {
			return (
				<div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
					<div className="max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg">
						<h1 className="text-xl font-bold text-red-600">Something went wrong</h1>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
							{this.state.error?.message || "Unknown error"}
						</p>
						<button
							type="button"
							className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
							onClick={() => window.location.reload()}
						>
							Reload page
						</button>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
