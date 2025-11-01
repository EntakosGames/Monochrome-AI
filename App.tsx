
import React, { useState, useCallback } from 'react';
import { generateMonochromeImage } from './services/geminiService';

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const newImageBase64 = await generateMonochromeImage(prompt);
            setGeneratedImage(`data:image/png;base64,${newImageBase64}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    const handleDownload = useCallback(() => {
        if (!generatedImage) return;

        const link = document.createElement('a');
        link.href = generatedImage;
        const filename = prompt.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').substring(0, 50) || 'generated_image';
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [generatedImage, prompt]);

    const isGenerateDisabled = !prompt.trim() || isLoading;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center">
            <header className="text-center p-4 md:p-6 w-full border-b border-gray-700">
                <h1 className="text-3xl md:text-4xl font-bold text-white">Gemini Monochrome Generator</h1>
                <p className="text-md md:text-lg text-gray-400 mt-2">Generate black and white images from your text prompts.</p>
            </header>

            <main className="flex-grow container mx-auto p-4 flex flex-col items-center w-full max-w-2xl">
                <div className="w-full bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-white">1. Describe Your Image</h2>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'A majestic lion', 'A futuristic city skyline', 'A delicate flower'"
                            className="w-full h-28 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500 transition"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button
                        onClick={handleSubmit}
                        disabled={isGenerateDisabled}
                        className={`w-full flex justify-center items-center text-lg font-bold py-3 px-6 rounded-lg transition-all duration-300 ${isGenerateDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105 shadow-lg'}`}
                    >
                        {isLoading ? <LoadingSpinner /> : 'Generate'}
                    </button>
                    {error && <div className="mt-2 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-center">{error}</div>}
                    
                    <div className="mt-4">
                      <h2 className="text-xl font-semibold mb-4 text-white text-center">2. Result</h2>
                      <div className="w-full aspect-square border-2 border-dashed border-gray-600 rounded-lg flex justify-center items-center relative overflow-hidden bg-gray-900/50">
                          {isLoading && (
                               <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-10">
                                  <LoadingSpinner />
                                  <p className="text-white mt-2">Generating your image...</p>
                              </div>
                          )}
                          {generatedImage ? (
                              <img src={generatedImage} alt="Generated" className="max-h-full max-w-full object-contain" />
                          ) : (
                              <p className="text-gray-500 text-center p-4">Your generated image will appear here.<br/>It will be drawn in white on a black background.</p>
                          )}
                      </div>
                      {generatedImage && !isLoading && (
                          <button
                            onClick={handleDownload}
                            className="mt-4 w-full flex justify-center items-center text-lg font-bold py-3 px-6 rounded-lg transition-all duration-300 bg-green-600 hover:bg-green-700 transform hover:scale-105 shadow-lg"
                            aria-label="Download generated image"
                          >
                              Download Image
                          </button>
                      )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
