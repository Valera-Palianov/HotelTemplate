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
fs
	.readdirSync(__dirname + '/src/pages')
	.filter((file) => {
		return file.indexOf('base') !== 0;
	})
	.forEach((file) => {
		pages.push(file.split('/', 2));
	})

const htmlPlugins = pages.map(fileName => new HtmlWebpackPlugin({
	getData: () => {
		try {
			return JSON.parse(fs.readFileSync(`./src/pages/${fileName}/data.json`, 'utf8'))
		} catch (e) {
			console.warn(`data.json was not provided for page ${fileName}`)
      		return {}
		}
	},
	filename: `${fileName}.html`,
	template: `./src/pages/${fileName}/${fileName}.pug`,
	inject: 'body',
	hash: true,
}))

const confMode = process.env.NODE_ENV
const confPlugins = [new CleanWebpackPlugin()].concat(htmlPlugins)
const confOptimization = {}
const confDevServer = {}
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
			loader: 'pug-loader',
		},
		{
			test: /\.(png|jpg|svg|ttf|eot|woff|woff2)$/,
			loader: 'file-loader',
			options: {
		        name: '[path][name].[ext]?[hash]',
		        context: 'src'
		    }
		}
	]
}
const confOutput = {
	filename: 'js/[name].bundle.js',
	path: __dirname + "/dist",
	chunkFilename: 'js/[name].bundle.js',
	publicPath: '/'
}
let confDevtool = false

if(process.env.NODE_ENV === "production") {
	confOutput.publicPath = './'
	confPlugins.push(new MiniCssExtractPlugin({filename: 'style/[name].css',}))
	confOptimization.minimizer = [
		new UglifyJsPlugin({
			uglifyOptions: {
				mangle: true
			}
		})
	]
	confModule.rules.push({
		test: /\.css$/,
		use: [MiniCssExtractPlugin.loader, 'css-loader']
	})
	confModule.rules.push(
		{
			test: /\.scss$/,
			use: [
				MiniCssExtractPlugin.loader,
				'css-loader',
				{
					loader: 'postcss-loader',
					options: {
						plugins: function () {
							return [
								autoprefixer({overrideBrowserslist: ['last 2 versions']}),
							]
						}
					}
				},
				'sass-loader',
				{
					loader: 'postcss-loader',
					options: {
						syntax: postcssSCSS,
						plugins: function () {
							return [
								doiuse({
									browsers:['ie >= 11', 'last 2 versions'],
									ignore: ['flexbox', 'rem', 'css-resize', 'css-masks', 'object-fit'],
									ignoreFiles: ['**/normalize.css'],
								})
							]
						}
					}
				}
			]
		}
	)
}

if(process.env.NODE_ENV === "development") {
	confDevtool = 'eval'
	confOutput.pathinfo = true
	confPlugins.push(new webpack.HotModuleReplacementPlugin())

	confDevServer.inline = true
	confDevServer.hot = true
	confDevServer.contentBase = 'dist'
	confDevServer.host = '0.0.0.0'
	confDevServer.port = process.env.PORT
	
	confModule.rules.push({
		test: /\.css/,
		use: [
			'style-loader',
			'css-loader'
		]
	})
	confModule.rules.push(
		{
			test: /\.scss$/,
			use: [
				'style-loader',
				{
					loader: 'css-loader',
					options: {
						importLoaders: 1
					}	
				},
				{
					loader: 'postcss-loader',
					options: {
						plugins: function () {
							return [
								autoprefixer({overrideBrowserslist: ['last 2 versions']}),
							]
						}
					}
				},
				'sass-loader',
				{
					loader: 'postcss-loader',
					options: {
						syntax: postcssSCSS,
						plugins: function () {
							return [
								doiuse({
									browsers:['ie >= 11', 'last 2 versions'],
									ignore: ['flexbox', 'rem', 'css-resize', 'css-masks', 'object-fit'],
									ignoreFiles: ['**/normalize.css'],
								})
							]
						}
					}
				}
			]
		}
	)
}

const conf = {
	entry: './src/index.js',
	devtool: confDevtool,
	output: confOutput,
	module: confModule,
	mode: process.env.NODE_ENV,
	plugins: confPlugins,
	optimization: confOptimization,
	devServer: confDevServer
}

module.exports = conf
