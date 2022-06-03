import React, { Fragment } from "react";
import {
  BackHandler,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  View,
  Text,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.startingUrl = "http://tatnaywonapp.com/";
    this.state = {
      canGoBack: false,
    };
    this.handleBackButton = this.handleBackButton.bind(this);
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    const { canGoBack } = this.state;
    if (canGoBack) {
      this.webView.goBack();
      return true;
    } else {
      Alert.alert("TatNayWonProperty.com", "Do you really want to exit?", [
        {
          text: "No",
          onPress: () => null,
          style: "cancel",
        },
        { text: "Yes", onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    }
  };

  render() {
    return (
      <Fragment>
        <StatusBar hidden={true} />
        <WebView
          source={{ uri: this.startingUrl }}
          ref={(webView) => (this.webView = webView)}
          startInLoadingState={true}
          javaScriptEnabled={true}
          allowsFullscreenVideo={true}
          cacheEnabled={true}
          sharedCookiesEnabled={true}
          domStorageEnabled={true}
          decelerationRate="normal"
          originWhitelist={["http://*", "https://*", "intent://*"]}
          useWebKit={true}
          geolocationEnabled={true}
          renderError={() => {
            return (
              <View
                style={{
                  backgroundColor: "#ffffff",
                  height:
                    Dimensions.get("window").width +
                    Dimensions.get("window").height,
                  justifyContent: "center",
                  alignItems: "center",
                  width: Dimensions.get("window").width,
                  position: "absolute",
                }}
              >
                <ActivityIndicator size="large" color="#f08f33" />
                <Text>Loading...</Text>
              </View>
            );
          }}
          injectedJavaScript={`
          (function() {
            function wrap(fn) {
              return function wrapper() {
                var res = fn.apply(this, arguments);
                window.ReactNativeWebView.postMessage('navigationStateChange');
                return res;
              }
            }

            history.pushState = wrap(history.pushState);
            history.replaceState = wrap(history.replaceState);
            window.addEventListener('popstate', function() {
              window.ReactNativeWebView.postMessage('navigationStateChange');
            });
          })();
          true;
        `}
          onMessage={({ nativeEvent: state }) => {
            if (state.data === "navigationStateChange") {
              this.setState({
                canGoBack: state.canGoBack,
              });
            }
          }}
        />
      </Fragment>
    );
  }
}

export default App;
