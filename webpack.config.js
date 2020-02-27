const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

const {CleanWebpackPlugin} = require('clean-webpack-plugin') //Каждый раз очищает папку dist, на случай если какие-то файлы были переименованы или перемещены
const HtmlWebpackPlugin = require('html-webpack-plugin') //Плагин для работы с HTML, в основном нужен для автомитического встраивания скриптов
const MiniCssExtractPlugin = require('mini-css-extract-plugin') //Плагин для извлечения всех CSS файлов в отдельный файл при сборке
const postcssSCSS = require('postcss-scss') //Плагин для PostCSS, позволяющий воспринимать синтаксис SCSS
const autoprefixer = require('autoprefixer') //Автоматически добавляет префиксы для свойств Css
const doiuse = require('doiuse') //Инофрмирует о несовместимости тех или иных CSS свойств с браузерами
const UglifyJsPlugin = require('uglifyjs-webpack-plugin') //Сжимает JS

/*Так как приложение у нас многостраничное, а так же потому, что мы используем html-webpack-plugin, нам нужно встроить
наш JS скрипт в каждую из страниц. Но html-webpack-plugin позволяет указать только одну за раз. Поэтому мы ищем все наши 
HTML файлы (в данном случае в формате pug), загоняем их в массив, и создаем по экземпляру html-webpack-plugin на каждую*/

const pages = []

//Переменная с будующим списком чанков. Пока есть только основной, который нужен на всех страницах.
const chunks = {
	'main' : './index.js'
}
//Цикл в котором просматриваются все директории в pages
fs.readdirSync(path.resolve(__dirname, 'src', 'pages')).filter((file) => {
	return file.indexOf('base') !== 0;
}).forEach((file) => {
	pages.push(file.split('/', 2));
})

//Цикл, где на каждый файл pug в директории (с тем же именем) создается экземпляр html-webpack-plugin
const htmlPlugins = pages.map(fileName => {
	const conf = {
		filename: `${fileName}.html`,
		template: `./pages/${fileName}/${fileName}.pug`,
		inject: 'body',
		hash: true,
	}

	//Если в директории лежит еще и js файл с тем же именем, то мы добавляем его как новую точку входа webpack (создаем чанк), и тут же говорим 
	//html-webpack-plugin чтобы он подключал его в текущую страницу, вместе с основным чанком и чанком библиотек vendors
	if(fs.existsSync(path.resolve(__dirname, 'src', `./pages/${fileName}/${fileName}.js`))) {
		chunks[fileName] = path.resolve(__dirname, 'src', `./pages/${fileName}/${fileName}.js`)
		conf.chunks = [fileName.toString(), 'main', 'vendors']
	}

	return new HtmlWebpackPlugin(conf)
})

const confGeneral = {
	mode: process.env.NODE_ENV,
	result: process.env.NODE_RESULT,
	devtool: process.env.NODE_ENV == 'development' ? 'source-map' : '',
	entry: chunks,
	context: path.resolve(__dirname, 'src')
}

const confResolve = {
	alias: {
		ROOT: path.resolve(__dirname, 'src/'),
	}
}

const confOutput = {
	filename: 'assets/js/[name].bundle.js?[hash]',
	path: path.resolve(__dirname, 'dist'),
	chunkFilename: 'assets/js/[name].bundle.js?[hash]',
}

const getOptimization = (mode = confGeneral.mode) => {
	optimization = {}
	optimization.splitChunks = {
		chunks: 'all',
		cacheGroups: {
			vendor: {
				name: 'vendors',
				test: /node_modules/,
				chunks: 'all',
				enforce: true,
			}
		}
	}
	if(mode == "production") {
		optimization.minimizer = [
			new UglifyJsPlugin(
				{
					uglifyOptions: {
						mangle: true
					}
				}
			)
		]
	}
	return optimization
}

const getPlugins = (result = confGeneral.result) => {
	const plugins = [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			'window.jQuery': 'jquery',
		})
	]
	if(result == "build") {
		plugins.push(
			new CleanWebpackPlugin()
		)
		plugins.push(
			new MiniCssExtractPlugin(
				{
					filename: 'assets/style/[name].css?[hash]'
				}
			)
		)
	} else {
		plugins.push(
			new webpack.HotModuleReplacementPlugin()
		)
	}
	return plugins
}

const getCssRule = (result = confGeneral.result) => {
	const loaders = []
	if(result == "build") {
		loaders.push(MiniCssExtractPlugin.loader)
	} else {
		loaders.push('style-loader')
	}
	loaders.push('css-loader')
	loaders.push(
		{
			loader: 'postcss-loader',
			options: {
				plugins: function () {
					return [
						autoprefixer(),
					]
				}
			}
		}
	)
	return loaders
}
const getScssRule = (mode = confGeneral.mode, defaultLoaders = getCssRule()) => {
	const loaders = defaultLoaders
	loaders.push({
		loader: 'sass-loader',
		options: {
			sourceMap: mode == "development" ? true : false,
		}
	})
	if(mode == "development") {
		loaders.push(
			{
				loader: 'postcss-loader',
				options: {
					syntax: postcssSCSS,
					plugins: function () {
						return [
							doiuse({
								browsers:['> 2.5%', 'not dead'],
								ignore: ['flexbox', 'rem', 'css-resize', 'css-masks', 'object-fit'],
								ignoreFiles: ['**/normalize.css'],
							})
						]
					}
				}
			}
		)
	}
	return loaders
}

const getDevServer = (result = confGeneral.result, port = process.env.PORT) => {
	devServer = {}
	if(result == "server") {
		devServer.inline = true
		devServer.hot = true
		devServer.contentBase = 'dist'
		devServer.host = 'localhost'
		devServer.port = port
	}
	return devServer
}

const confPlugins = getPlugins().concat(htmlPlugins)
const confOptimization = getOptimization()
const confDevServer = getDevServer()
const confModule = {
	rules: [
		{
			test: /\.js$/,
    		loader: 'babel-loader',
    		exclude: [
    			/node_modules/,
    		]
		},
		{
			test: /\.pug$/,
			loader: {
				loader: 'pug-loader',
				options: {
					pretty: process.env.NODE_ENV == 'development' ? true : false
				}
			},
		},
		{
			test: /\.(png|jpg|svg)$/,
			use: [
				{
					loader: 'file-loader',
					options: {
				        name: 'img/[name].[ext]?[hash]',
				    }
				}
			]
		},
		{
			test: /\.(ttf|eot|woff|woff2)$/,
			use: [
				{
					loader: 'file-loader',
					options: {
				        name: '/assets/fonts/[name].[ext]?[hash]',
				        publicPath: '../../',
				    }
				}
			]
		},
		{
			test: /\.css$/,
			use: getCssRule(),
		},
		{
			test: /\.scss$/,
			use: getScssRule(),
		}
	]
}

const conf = {
	context: confGeneral.context,
	entry: confGeneral.entry,
	devtool: confGeneral.devtool,
	mode: confGeneral.mode,
	output: confOutput,
	module: confModule,
	resolve: confResolve,
	plugins: confPlugins,
	optimization: confOptimization,
	devServer: confDevServer
}

module.exports = conf