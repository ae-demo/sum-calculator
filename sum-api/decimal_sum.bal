// Exact decimal-string addition. Ballerina's decimal type is limited to 34
// significant digits, so the digits are added as strings to stay exact for any length.

type ParsedNumber record {|
    boolean negative;
    // integer and fraction digits joined, leading zeros removed ("" when zero)
    string digits;
    // number of trailing digits that belong to the fraction
    int scale;
|};

final string:RegExp NUMBER_PATTERN = re `[+-]?([0-9]+(\.[0-9]+)?|\.[0-9]+)`;

function parseNumber(string raw, string label) returns ParsedNumber|error {
    string text = raw.trim();
    if text == "" {
        return error(label + " is required");
    }
    if !NUMBER_PATTERN.isFullMatch(text) {
        return error(label + " is not a valid decimal number");
    }
    boolean negative = text.startsWith("-");
    string body = text;
    if text.startsWith("-") || text.startsWith("+") {
        body = text.substring(1);
    }
    int? dot = body.indexOf(".");
    string whole = body;
    string fraction = "";
    if dot is int {
        whole = body.substring(0, dot);
        fraction = body.substring(dot + 1);
    }
    return {negative, digits: stripZeros(whole + fraction), scale: fraction.length()};
}

function stripZeros(string digits) returns string {
    int index = 0;
    while index < digits.length() && digits.substring(index, index + 1) == "0" {
        index += 1;
    }
    return digits.substring(index);
}

function padLeft(string digits, int width) returns string {
    string result = digits;
    while result.length() < width {
        result = "0" + result;
    }
    return result;
}

function padRight(string digits, int width) returns string {
    string result = digits;
    while result.length() < width {
        result = result + "0";
    }
    return result;
}

// -1, 0 or 1 comparing two zero-stripped digit strings
function compareMagnitude(string left, string right) returns int {
    if left.length() != right.length() {
        return left.length() < right.length() ? -1 : 1;
    }
    if left == right {
        return 0;
    }
    return left < right ? -1 : 1;
}

function addMagnitude(string left, string right) returns string {
    int width = left.length() > right.length() ? left.length() : right.length();
    int[] leftDigits = padLeft(left, width).toCodePointInts();
    int[] rightDigits = padLeft(right, width).toCodePointInts();
    string result = "";
    int carry = 0;
    int index = width - 1;
    while index >= 0 {
        int total = leftDigits[index] - 48 + rightDigits[index] - 48 + carry;
        result = (total % 10).toString() + result;
        carry = total / 10;
        index -= 1;
    }
    return carry > 0 ? carry.toString() + result : result;
}

// left must be greater than or equal to right
function subtractMagnitude(string left, string right) returns string {
    int width = left.length();
    int[] leftDigits = left.toCodePointInts();
    int[] rightDigits = padLeft(right, width).toCodePointInts();
    string result = "";
    int borrow = 0;
    int index = width - 1;
    while index >= 0 {
        int diff = leftDigits[index] - rightDigits[index] - borrow;
        if diff < 0 {
            diff += 10;
            borrow = 1;
        } else {
            borrow = 0;
        }
        result = diff.toString() + result;
        index -= 1;
    }
    return stripZeros(result);
}

function formatNumber(boolean negative, string digits, int scale) returns string {
    string padded = padLeft(digits, scale + 1);
    int cut = padded.length() - scale;
    string whole = padded.substring(0, cut);
    string text = scale == 0 ? whole : whole + "." + padded.substring(cut);
    boolean isZero = stripZeros(padded) == "";
    return negative && !isZero ? "-" + text : text;
}

# Adds two decimal strings exactly, with no rounding. The result keeps the larger scale.
#
# + first - first decimal string
# + second - second decimal string
# + return - the exact sum, or an error describing which input is invalid
function addDecimalStrings(string first, string second) returns string|error {
    ParsedNumber left = check parseNumber(first, "a");
    ParsedNumber right = check parseNumber(second, "b");
    int scale = left.scale > right.scale ? left.scale : right.scale;
    string leftDigits = padRight(left.digits, left.digits.length() + scale - left.scale);
    string rightDigits = padRight(right.digits, right.digits.length() + scale - right.scale);
    if left.negative == right.negative {
        return formatNumber(left.negative, addMagnitude(leftDigits, rightDigits), scale);
    }
    int cmp = compareMagnitude(leftDigits, rightDigits);
    if cmp == 0 {
        return formatNumber(false, "", scale);
    }
    if cmp > 0 {
        return formatNumber(left.negative, subtractMagnitude(leftDigits, rightDigits), scale);
    }
    return formatNumber(right.negative, subtractMagnitude(rightDigits, leftDigits), scale);
}
