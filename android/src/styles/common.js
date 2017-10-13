import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { Dimensions, PixelRatio, StatusBar } from 'react-native';
var { height, width } = Dimensions.get('window');

export var blueTextShadow = '#3399ff';
export var extraLargeFontSize = responsiveFontSize(3.4);
export var largeFontSize = responsiveFontSize(2.8);
export var mediumFontSize = responsiveFontSize(2.2);
export var primaryBlue = '#4286f4';
export var screenHeight = height;
export var screenWidth = width;
export var smallFontSize = responsiveFontSize(1.8);
export var titleTextShadow = 'grey';
export var xxlargeFontSize = responsiveFontSize(4.5);

/* Overview */
// MainButtons
export var mainButtonsHeight = responsiveHeight(9);
// Row
export var timerRowDescWidth = responsiveWidth(75);
export var timerRowDistanceWidth = responsiveWidth(25);
export var timerRowHeight = responsiveHeight(14);
export var timerRowWidth = responsiveWidth(115);
// TicketCounter
export var ticketCountFontSize = responsiveFontSize(5);
export var ticketDescFontSize = responsiveFontSize(2);

/* Camera */
// Time Limit
export var timeLimitContainerHeight = responsiveHeight(9);
// Capture
export var captureContainerHeight = responsiveHeight(10);
// LocationInput
export var textInputContainerHeight = responsiveHeight(25);

/* Search/Navigation */
export var closeButtonSize = responsiveHeight(3);
export var navBarContainerHeight = height * .09;
export var noResultContainerHeight = height * .27;
export var noResultHeight = height * .11;
export var pinHeight = responsiveHeight(5.5);
export var pinWidth = responsiveWidth(6);
export var resultContainerHeight = height * .34;
export var resultHeight = height * .14;
export var searchContainerHeight = height * .18;
export var separatorHeight = responsiveHeight(5);
export var staticCenterPoint = width / 2;
export var textInputOffset = PixelRatio.get() * 2;
export var titleFontSize = responsiveFontSize(3.5);
export var underlineWidth = responsiveWidth(40);
// Verification
export var verificationContainerHeight = responsiveHeight(42);

// Switched from a constant 3.8 to PixelRatio.getFontScale() which returns 3.5 -- Coincidence??
// TODO Check whether this scale "fix" holds up with lower dpi devices
export var windowCenterPoint = (width / 2) - PixelRatio.get() - 1;


/* Timer List */
//Title
export var timeLimitTitleContainerHeight = height * .05;
// Row
export var timerRowButtonsContainerHeight = height * .09;
export var timerRowDescContainerHeight = height * .12;
export var timerRowImageHeight = height * .564 - (StatusBar.currentHeight ? StatusBar.currentHeight : 0);
export var timerFlatListHeight = timerRowDescContainerHeight + timerRowButtonsContainerHeight + timerRowImageHeight;
// Done
export var doneHeight = responsiveHeight(10);

// Warning
export var warningContainerMarginTop = height * .22;

/* Profile */
export var textInputWidth = width - 100;

/* History */
// Row
export var imageSize = responsiveWidth(20);

/* FAQs */
// Messenger
export var messageContainerHeight = screenHeight - navBarContainerHeight - doneHeight - responsiveHeight(10);
