
import React, { useState, useCallback, useRef } from 'react';
import { generateImageFromPrompt } from './services/geminiService';

// Spinner Component
const Spinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Sparkles Icon Component
const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

// Download Icon Component
const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

// Upload Icon Component
const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

// Trash Icon Component
const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

// Clear Icon Component
const ClearIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface InputImage {
    data: string;
    name: string;
}

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [inputImage, setInputImage] = useState<InputImage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setImageUrl(null);
    setError(null);

    try {
      const imageData = inputImage ? [inputImage.data] : null;
      const url = await generateImageFromPrompt(prompt, imageData);
      setImageUrl(url);
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, inputImage]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleGenerateImage();
      }
  };

  const handleClearPrompt = useCallback(() => {
    setPrompt('');
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImage({ data: reader.result as string, name: file.name });
      };
      reader.readAsDataURL(file);
      setError(null);
    } else if (file) {
      setError("Formato de arquivo inválido. Por favor, use PNG, JPEG ou WEBP.");
    }
     // Reset file input to allow uploading the same file again
    if (e.target) {
        e.target.value = '';
    }
  };

  const removeInputImage = useCallback(() => {
    setInputImage(null);
  }, []);

  const handleDownloadImage = useCallback(() => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    const fileName = `gemini-image-${Date.now()}.png`;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center flex-grow">
        <header className="text-center my-8 md:my-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 pb-2">
                Criador Mágico de Imagens
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
                Transforme suas frases e imagens em posts incríveis.
            </p>
        </header>

        <div className="w-full p-6 bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700 backdrop-blur-sm sticky top-4 z-10">
            <div className="flex flex-col space-y-4">
              <div className="relative w-full">
                <label htmlFor="prompt-input" className="font-semibold text-gray-200 sr-only">
                    Digite sua frase criativa aqui:
                </label>
                <textarea
                    id="prompt-input"
                    value={prompt}
                    onChange={handlePromptChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: um gato astronauta com um filtro retrô..."
                    className="w-full p-4 pr-12 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 resize-none text-white placeholder-gray-400"
                    rows={3}
                />
                {prompt && (
                    <button
                        onClick={handleClearPrompt}
                        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full transition-colors duration-200"
                        aria-label="Limpar texto"
                    >
                        <ClearIcon />
                    </button>
                )}
              </div>
               
                <div>
                    {inputImage ? (
                        <div className="p-2 bg-gray-700/50 border border-gray-600 rounded-lg flex items-center justify-between animate-fade-in">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <img src={inputImage.data} alt="Pré-visualização" className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                                <span className="text-sm text-gray-300 truncate">{inputImage.name}</span>
                            </div>
                            <button
                                onClick={removeInputImage}
                                className="p-2 text-gray-400 hover:text-white hover:bg-red-500/50 rounded-full transition-colors duration-200 flex-shrink-0"
                                aria-label="Remover imagem"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ) : (
                         <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/50 hover:border-purple-500 transition-all duration-300"
                            >
                                <UploadIcon />
                                <span className="text-gray-400">Carregar Imagem (Opcional)</span>
                            </label>
                        </div>
                    )}
                </div>

              <button
                onClick={handleGenerateImage}
                disabled={isLoading || !prompt.trim()}
                className="inline-flex items-center justify-center w-full px-6 py-3 font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    <span className="ml-2">Gerando...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon />
                    <span className="ml-2">{inputImage ? 'Gerar Edição' : 'Gerar Imagem'}</span>
                  </>
                )}
              </button>
            </div>
        </div>

        <div className="w-full mt-8 flex-grow">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-2xl border border-gray-700 h-full">
              <Spinner />
              <p className="mt-4 text-gray-300 text-center">A mágica está acontecendo...<br/>Por favor, aguarde.</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
              <p><strong>Oops! Algo deu errado.</strong></p>
              <p className="mt-2">{error}</p>
            </div>
          )}
          {imageUrl && !isLoading && (
            <div className="bg-gray-800 p-2 sm:p-4 rounded-2xl border border-gray-700 shadow-lg animate-fade-in flex flex-col gap-4">
              <img
                src={imageUrl}
                alt="Imagem gerada pela IA a partir do prompt"
                className="w-full h-auto rounded-xl object-contain aspect-square"
              />
               <button
                onClick={handleDownloadImage}
                className="inline-flex items-center justify-center w-full px-6 py-3 font-bold text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-md hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
              >
                <DownloadIcon />
                <span className="ml-2">Baixar Imagem</span>
              </button>
            </div>
          )}
          {!imageUrl && !isLoading && !error && (
            <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-700 rounded-2xl flex items-center justify-center h-full">
              <p>Sua imagem aparecerá aqui quando for gerada.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
