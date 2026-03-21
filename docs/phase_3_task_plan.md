# Phase 3 任务计划 - Intent Parser Agent

**阶段**: Phase 3 - Intent Parser Agent
**目标**: 实现自然语言到 GameSpec 的转换
**预估时间**: 2 周

---

## 📋 任务列表

### Task #11: LLM 集成基础设施 ⏳
**预估时间**: 2-3 天
**优先级**: P0

**任务内容**:
- [ ] 创建 `@loom/llm-client` 包
- [ ] 实现 OpenAI API 集成
- [ ] 实现 Claude API 集成
- [ ] 实现统一接口
- [ ] 添加错误处理和重试逻辑
- [ ] 编写单元测试

**输出**:
- `@loom/llm-client` 包
- OpenAI 和 Claude 客户端实现
- 测试覆盖率 > 80%

---

### Task #12: Prompt Engineering ⏳
**预估时间**: 1-2 天
**优先级**: P0

**任务内容**:
- [ ] 设计 Intent Parser System Prompt
- [ ] 编写 Few-shot Examples
  - [ ] Jumper game example
  - [ ] Shooter game example
  - [ ] Runner game example
- [ ] 测试 Prompt 效果
- [ ] 优化 Prompt

**输出**:
- Intent Parser System Prompt
- Few-shot examples 文件
- Prompt 测试报告

---

### Task #13: Intent Parser Agent 实现 ⏳
**预估时间**: 3-4 天
**优先级**: P0

**任务内容**:
- [ ] 创建 `@loom/intent-parser` 包
- [ ] 实现 Prompt Normalization
- [ ] 实现 Intent Extraction
- [ ] 实现 JSON Schema Constrained Decoding
- [ ] 实现 Semantic Repair Engine
- [ ] 实现 Default Injection
- [ ] 实现 Validation
- [ ] 实现 Confidence Scoring
- [ ] 编写单元测试

**输出**:
- `@loom/intent-parser` 包
- IntentParserAgent 类
- 测试覆盖率 > 80%

---

### Task #14: 集成测试和优化 ⏳
**预估时间**: 2-3 天
**优先级**: P1

**任务内容**:
- [ ] 准备测试数据集（20+ prompts）
- [ ] 端到端测试：自然语言 → GameSpec → 游戏
- [ ] 测试生成质量
- [ ] 优化 Prompt 和参数
- [ ] 测量准确率和稳定性
- [ ] 编写测试报告

**输出**:
- 测试数据集
- E2E 测试脚本
- 质量报告
- 优化建议

---

## 🎯 成功标准

1. **功能完整** ✅
   - 支持自然语言输入
   - 生成有效的 GameSpec
   - 通过 JSON Schema 验证

2. **质量保证** ✅
   - 测试覆盖率 > 80%
   - 生成的 GameSpec 可运行
   - 错误处理完善

3. **性能要求** ✅
   - 单次生成 < 10 秒
   - 成功率 > 90%

---

## 📊 进度跟踪

- Task #11: 0% ⏳
- Task #12: 0% ⏳
- Task #13: 0% ⏳
- Task #14: 0% ⏳

**总体进度**: 0% (0/4 tasks)

---

## 🚀 下一步行动

**立即开始**: Task #11 - LLM 集成基础设施

**执行步骤**:
1. 创建 `@loom/llm-client` 包
2. 定义统一接口
3. 实现 OpenAI 客户端
4. 实现 Claude 客户端
5. 添加测试

---

**Phase 3 目标**: 让用户可以用自然语言描述游戏，自动生成 GameSpec！🎯
