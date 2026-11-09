import ballerina/http;
import ballerina/jwt;
import ballerina/os;
import ballerina/test;

// Run with the throwaway keypair exported (see the commands in the verify step):
//   GATEWAY_ASSERTION_CERTIFICATE, GATEWAY_ASSERTION_ISSUER, GATEWAY_ASSERTION_HEADER
//   TEST_ASSERTION_KEY_FILE (private key of the same pair)
// Listener starts before tests, so these must be set before `bal test`.

final http:Client sumClient = check new ("http://localhost:9090");

function mint(string keyPath, string issuer) returns string|error {
    jwt:IssuerConfig config = {
        issuer,
        username: "test-user",
        expTime: 300,
        customClaims: {"scope": "sums:calculate"},
        signatureConfig: {algorithm: jwt:RS256, config: {keyFile: keyPath}}
    };
    return jwt:issue(config);
}

function headers(string token) returns map<string> {
    return {[os:getEnv("GATEWAY_ASSERTION_HEADER")]: token};
}

function post(string a, string b, string token) returns http:Response|error {
    return sumClient->post("/sums", {a, b}, headers(token));
}

function validToken() returns string|error {
    return mint(os:getEnv("TEST_ASSERTION_KEY_FILE"), os:getEnv("GATEWAY_ASSERTION_ISSUER"));
}

@test:Config {}
function additionCases() returns error? {
    string token = check validToken();
    [string, string, string][] cases = [
        ["1", "2", "3"],
        ["0.1", "0.2", "0.3"],
        ["-4.25", "1", "-3.25"],
        ["-1.5", "-2.5", "-4.0"],
        ["5", "-5", "0"],
        ["1.50", "-1.5", "0.00"],
        ["123456789012345678901234567890.123456789", "0.000000001", "123456789012345678901234567890.123456790"],
        ["99999999999999999999999999999999999999", "1", "100000000000000000000000000000000000000"],
        ["+7", ".5", "7.5"],
        ["1000", "-0.001", "999.999"]
    ];
    foreach [string, string, string] c in cases {
        http:Response res = check post(c[0], c[1], token);
        test:assertEquals(res.statusCode, 200, c[0] + " + " + c[1]);
        json body = check res.getJsonPayload();
        test:assertEquals(check body.sum, c[2], c[0] + " + " + c[1]);
    }
}

@test:Config {}
function malformedInputIs400() returns error? {
    string token = check validToken();
    [string, string][] cases = [["", "1"], ["1", "  "], ["abc", "1"], ["1", "1e5"], ["1.", "2"], ["--1", "2"], ["1,5", "2"]];
    foreach [string, string] c in cases {
        http:Response res = check post(c[0], c[1], token);
        test:assertEquals(res.statusCode, 400, c[0] + " + " + c[1]);
        json body = check res.getJsonPayload();
        test:assertEquals(check body.code, 400);
        test:assertTrue((check body.message) is string);
    }
}

@test:Config {}
function missingFieldIs400() returns error? {
    string token = check validToken();
    http:Response res = check sumClient->post("/sums", {a: "1"}, headers(token));
    test:assertEquals(res.statusCode, 400);
}

@test:Config {}
function noAssertionIs401() returns error? {
    http:Response res = check sumClient->post("/sums", {a: "1", b: "2"});
    test:assertEquals(res.statusCode, 401);
}

@test:Config {}
function wrongKeyIs401() returns error? {
    string otherKey = os:getEnv("TEST_OTHER_KEY_FILE");
    string token = check mint(otherKey, os:getEnv("GATEWAY_ASSERTION_ISSUER"));
    http:Response res = check post("1", "2", token);
    test:assertEquals(res.statusCode, 401);
}

@test:Config {}
function tamperedPayloadIs401() returns error? {
    string token = check validToken();
    string[] parts = re `\.`.split(token);
    string forged = parts[0] + "." + (parts[1].length() > 4 ? parts[1].substring(0, parts[1].length() - 4) + "AAAA" : "AAAA") + "." + parts[2];
    http:Response res = check post("1", "2", forged);
    test:assertEquals(res.statusCode, 401);
}
