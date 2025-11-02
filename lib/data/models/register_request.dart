import '../models/model.dart';

/// Модель запроса регистрации
class RegisterRequest implements Model {
  final String email;
  final String username;
  final String password;

  RegisterRequest({
    required this.email,
    required this.username,
    required this.password,
  });

  @override
  Map<String, dynamic> toJson() {
    return {'email': email, 'username': username, 'password': password};
  }

  /// Валидация данных
  String? validate() {
    if (email.isEmpty) {
      return 'Email обязателен';
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      return 'Неверный формат email';
    }
    if (username.isEmpty) {
      return 'Имя пользователя обязательно';
    }
    if (username.length < 3 || username.length > 30) {
      return 'Имя пользователя должно быть от 3 до 30 символов';
    }
    if (password.isEmpty) {
      return 'Пароль обязателен';
    }
    if (password.length < 6 || password.length > 100) {
      return 'Пароль должен быть от 6 до 100 символов';
    }
    return null;
  }
}
