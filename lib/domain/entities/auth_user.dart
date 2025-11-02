import '../entities/entity.dart';

/// Доменная сущность аутентифицированного пользователя
class AuthUser extends Entity {
  final String id;
  final String email;
  final String username;
  final bool isAdmin;

  const AuthUser({
    required this.id,
    required this.email,
    required this.username,
    required this.isAdmin,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthUser &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          email == other.email &&
          username == other.username &&
          isAdmin == other.isAdmin;

  @override
  int get hashCode =>
      id.hashCode ^ email.hashCode ^ username.hashCode ^ isAdmin.hashCode;

  @override
  String toString() =>
      'AuthUser(id: $id, email: $email, username: $username, isAdmin: $isAdmin)';
}
