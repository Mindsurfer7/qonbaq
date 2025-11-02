import '../models/model.dart';

/// Модель запроса логина
class LoginRequest implements Model {
  final String email;
  final String password;

  LoginRequest({required this.email, required this.password});

  @override
  Map<String, dynamic> toJson() {
    return {'email': email, 'password': password};
  }

  /// Валидация данных
  String? validate() {
    if (email.isEmpty) {
      return 'Email обязателен';
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      return 'Неверный формат email';
    }
    if (password.isEmpty) {
      return 'Пароль обязателен';
    }
    return null;
  }
}
