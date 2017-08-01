import React, {Component} from "react"
import {Alert, BackHandler, NetInfo, Platform, WebView} from "react-native"
import Uri from 'jsuri'

export default class App extends Component {

    constructor(props) {
        super(props)

        this.url = 'https://letsencrypt.org/'
        this.offlineHtml = '<h1>Hello Container</h1>'

        this.state = {
            refresh: false,
            backButtonEnabled: false,
            source: {uri: this.url}
        }

        this.handleConnectivityChange = this.handleConnectivityChange.bind(this)
        this.onNavigationStateChange = this.onNavigationStateChange.bind(this)
        this.backHandler = this.backHandler.bind(this)

    }

    handleConnectivityChange(connected) {
        if (connected === false) {
            Alert.alert(
                'Attention',
                'Please connect to internet',
                [
                    {text: 'OK'},
                ],
                {cancelable: false}
            )
        }
        const source = connected ? {uri: this.url} : {html: this.offlineHtml}
        this.setState({source})
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.backHandler);
        NetInfo.isConnected.addEventListener('change', this.handleConnectivityChange)

        NetInfo.isConnected.fetch().then(connected => {
            const source = connected ? {uri: this.url} : {html: this.offlineHtml}
            this.setState({source})
        })


    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backHandler)
        NetInfo.isConnected.removeEventListener('change', this.handleConnectivityChange)
    }

    backHandler() {
        if (this.state.backButtonEnabled) {
            this.refs.webview.goBack();
            return true;
        }
    }

    onNavigationStateChange(navState) {

        const uri = new Uri(navState.url)

        if(uri.protocol() === 'http' || uri.protocol() === 'https' ){
            this.url = navState.url
        }


        this.setState({
            backButtonEnabled: navState.canGoBack,
        });
    };

    render() {
        const styles = Platform.OS === 'ios' ? {marginTop: 20} : ''

        return (
            <WebView style={styles} domStorageEnabled={true} ref='webview'
                     onNavigationStateChange={this.onNavigationStateChange} source={this.state.source}/>
        )
    }
}
