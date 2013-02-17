var FUITA = (function() {
    return {
    postFacebook : function(msg) {
        window.fbAsyncInit = function() {
            // init the FB JS SDK
            FB.init({
                appId      : '143724395789427', // App ID from the App Dashboard
                channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File for x-domain communication
                status     : true, // check the login status upon init?
                cookie     : true, // set sessions cookies to allow your server to access the session?
                xfbml      : true  // parse XFBML tags on this page?
            });

            // Additional initialization code such as adding Event Listeners goes here
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    var uid = response.authResponse.userID;
                    var accessToken = response.authResponse.accessToken;

                    FB.api('/me/feed', 'post', {'access_token:'  + accessToken, 'message:'  + msg}, function (res) {
                        console.log(res);
                        console.log('facebook post ok.');
                    });

                } else if (response.status === 'not_authorized') {
                    // the user is logged in to Facebook, 
                    // but has not authenticated your app
                    FB.login(function(response) {
                        // handle the response
                    }, {scope: 'publish_stream,user_videos'});
        
                } else {
                    // the user isn't logged in to Facebook.
                }
            });
        }
    }
    }

// Load the SDK's source Asynchronously
// Note that the debug version is being actively developed and might 
// contain some type checks that are overly strict. 
// Please report such bugs using the bugs tool.
(function(d, debug){
var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
if (d.getElementById(id)) {return;}
js = d.createElement('script'); js.id = id; js.async = true;
js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
ref.parentNode.insertBefore(js, ref);
}(document, /*debug*/ false));
})();