import 'dart:convert';
import 'package:http/http.dart' as http;

/// HTTP клиент для работы с API
class ApiClient {
  final String baseUrl;
  final http.Client client;

  ApiClient({required this.baseUrl, http.Client? client})
    : client = client ?? http.Client();

  /// GET запрос
  Future<http.Response> get(
    String endpoint, {
    Map<String, String>? headers,
  }) async {
    final url = Uri.parse('$baseUrl$endpoint');
    return await client.get(url, headers: headers);
  }

  /// POST запрос
  Future<http.Response> post(
    String endpoint, {
    Map<String, String>? headers,
    Object? body,
  }) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final defaultHeaders = {'Content-Type': 'application/json', ...?headers};
    return await client.post(
      url,
      headers: defaultHeaders,
      body: body != null ? jsonEncode(body) : null,
    );
  }

  /// PUT запрос
  Future<http.Response> put(
    String endpoint, {
    Map<String, String>? headers,
    Object? body,
  }) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final defaultHeaders = {'Content-Type': 'application/json', ...?headers};
    return await client.put(
      url,
      headers: defaultHeaders,
      body: body != null ? jsonEncode(body) : null,
    );
  }

  /// DELETE запрос
  Future<http.Response> delete(
    String endpoint, {
    Map<String, String>? headers,
  }) async {
    final url = Uri.parse('$baseUrl$endpoint');
    return await client.delete(url, headers: headers);
  }
}
