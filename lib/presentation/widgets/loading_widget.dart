import 'package:flutter/material.dart';

/// Виджет для отображения индикатора загрузки
class LoadingWidget extends StatelessWidget {
  const LoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(child: CircularProgressIndicator());
  }
}
