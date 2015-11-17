function isOperatorCharacter(char) {
    return (new RegExp("[*\\-+\\/^,=\\(\\)!~\\[\\]\\:_;]")).test(char);
}

function isOperatorToken(token) {
    var operators = ['+', '-', '*', '/', '%', '^', ',', '=', '(', ')', '!', '~', '[', ']', '::', '_', ';'];
    return operators.indexOf(token) != -1;
}

function isNumberCharacter(token) {
    return /[0-9\.]/.test(token);
}

function isNumberToken(token) {
    return (new RegExp("^-?[0-9]+(\\.[0-9]+)?$")).test(token);
}

function isStringToken(token) {
    return (new RegExp("^\\\".+\\\"$").test(token));
}

function isIdentifierToken(token) {
    return (new RegExp("[a-zA-Z]+")).test(token);
}

function storeNumber(value) {
    console.log('created number with value ' + value);
    return {
        type: 'number',
        value: function(context) {
            return value;
        },
        toString: function() {
            return value + '';
        },
        copy: function() {
            return this;
        },
        valueType: function() {
            return 'number';
        },
    };
}

function storeString(value) {
    console.log('created string with value ' + value);
    return {
        type: 'string',
        value: function(context) {
            return value;
        },
        toString: function() {
            return '\"' + value + '\"';
        },
        copy: function() {
            return this;
        },
        valueType: function() {
            return 'string';
        },
    };
}
function storeIdentifier(name, storage) {
    return {
        type: 'identifier',
        name: name,
        value: storage.value(),
        valueType: function() {
            return storage.type;
        },
        copy: function() {
            return this.value;
        },
        toString: function() {
            return storage.toString();
        },
    };
}

function tokenize(token, preceding, succeeding) {
    if (isOperatorToken(token)) {
        if (token == '^') {
            return {
                bound: 'right',
                precedence: 4,
                type: 'operator',
                name: 'power',
                toString: function() {
                    return 'operator^';
                },
            };
        } else if (token == '!') {
            return {
                bound: 'left',
                precedence: 5,
                type: 'operator',
                name: 'factorial',
                toString: function() {
                    return 'operator!';
                },
            }
        } else if (token == '::') {
            return {
                type: 'scope',
                toString: function() {
                    return 'operator::';
                },
            };
        } else if (token == ';') {
            return {
                type: 'semicolon',
                toString: function() {
                    return 'operator;';
                },
            };
        } else if (token == '+') {
            if (preceding == undefined || (isOperatorToken(preceding) && preceding != ')')) {
                return {
                    bound: 'right',
                    precedence: 6,
                    type: 'operator',
                    name: 'uninvert',
                    toString: function() {
                        return 'operator(+)';
                    },
                };
            } else {
                return {
                    bound: 'left',
                    precedence: 2,
                    type: 'operator',
                    name: 'add',
                    toString: function() {
                        return 'operator+';
                    },
                };
            }
        } else if (token == '-') {
            if (preceding == undefined || (isOperatorToken(preceding) && preceding != ')')) {
                return {
                    bound: 'right',
                    precedence: 6,
                    type: 'operator',
                    name: 'invert',
                    toString: function() {
                        return 'operator(-)';
                    },
                };
            } else {
                return {
                    bound: 'left',
                    precedence: 2,
                    type: 'operator',
                    name: 'subtract',
                    toString: function() {
                        return 'operator-';
                    },
                };
            }
        } else if (token == '*') {
            return {
                bound: 'left',
                precedence: 3,
                type: 'operator',
                name: 'multiply',
                toString: function() {
                    return 'operator*';
                },
            };
        } else if (token == '/') {
            return {
                bound: 'left',
                precedence: 3,
                type: 'operator',
                name: 'divide',
                toString: function() {
                    return 'operator/';
                },
            };
        } else if (token == '%') {
            return {
                bound: 'left',
                precedence: 1,
                type: 'operator',
                name: 'modulo',
                toString: function() {
                    return 'operator%';
                },
            };
        } else if (token == '=') {
            return {
                bound: 'left',
                precedence: 0,
                type: 'operator',
                name: 'assign',
                toString: function() {
                    return 'operator=';
                },
            };
        } else if (token == '~') {
            return {
                bound: 'right',
                precedence: 6,
                type: 'operator',
                name: 'round',
                toString: function() {
                    return 'operator~';
                },
            };
        } else if (token == ',') {
            return {
                type: 'seperator',
                value: ',',
                toString: function() {
                    return 'operator,';
                },
            };
        } else if (token == '(') {
            if (preceding == ']') {
                return {
                    type: 'lambdablock',
                    orientation: 'left',
                    toString: function() {
                        return 'operator(';
                    },
                };
            } else {
                return {
                    type: 'parentheses',
                    orientation: 'left',
                    toString: function() {
                        return 'operator(';
                    },
                };
            }
        } else if (token == ')') {
            return {
                type: 'parentheses',
                orientation: 'right',
                toString: function() {
                    return 'operator)';
                }
            };
        } else if (token == '[') {
            return {
                type: 'paramblock',
                orientation: 'left',
                toString: function() {
                    return 'operator[';
                }
            };
        } else if (token == ']') {
            return {
                type: 'paramblock',
                orientation: 'right',
                toString: function() {
                    return 'operator]';
                },
            };
        } else if (token == "_") {
            return {
                type: 'context',
                toString: function() {
                    return 'operator_'
                },
            };
        }
    } else if (isNumberToken(token)) {
        return {
            type: 'number',
            value: function(context) {
                return parseFloat(token);
            },
            toString: function() {
                return this.value() + '';
            },
            copy: function() {
                return this;
            },
            valueType: function() {
                return 'number';
            },
        };
    } else if (isStringToken(token)) {
        return {
            type: 'string',
            value: function(context) {
                return token.slice(1, token.length - 1);
            },
            toString: function() {
                return '\"' + this.value() + '\"';
            },
            copy: function() {
                return this;
            },
            valueType: function() {
                return 'string';
            },
        };
    } else if (isIdentifierToken(token)) {
        if (succeeding == '(') {
            return {
                type: 'function',
                name: token,
            };
        } else {
            return {
                type: 'identifier',
                name: token,
                value: function(context) {
                    var obj = context.get(token);
                    if (obj == undefined) {
                        throw 'error: undefined identifier';
                    } else {
                        return obj.value;
                    }
                },
                valueType: function(context) {
                    var obj = context.get(token);
                    if (obj == undefined) {
                        throw 'error: undefined identifier';
                    } else {
                        if (obj.type != 'identifier') {
                            return obj.type;
                        } else {
                            return obj.valueType(context);
                        }
                    }
                },
                copy: function(context) {
                    var type = this.valueType(context);
                    var value = this.value(context);

                    console.log(type, value);

                    if (type == 'string') {
                        return storeString(value);
                    } else if (type == 'number') {
                        return storeNumber(value);
                    }
                },
                toString: function(context) {
                    var type = this.valueType(context);
                    if (type == 'string') {
                        return '\"' + this.value(context) + '\"';
                    } else if (type == 'function') {
                        return 'function';
                    } else if (type == 'number') {
                        return this.value(context) + '';
                    }
                    return '';
                }
            };
        }
    }
    return {
        type: 'invalid',
        value: token,
    };
}

function evalPostfixExpression(postfixExpression, context) {
    var currentToken = undefined;
    var valueStack = [];
    while ((currentToken = postfixExpression.shift()) != undefined) {
        if (currentToken.type == 'function' || currentToken.type == 'operator' || currentToken.type == 'inline-function') {
            if (currentToken.type == 'function') {
                var func = context.get(currentToken.name);
            } else if (currentToken.type == 'operator') {
                var func = context.global().get(currentToken.name);
            } else if (currentToken.type == 'inline-function') {
                var func = currentToken;
            }
            console.log(valueStack.length);

            if (func.argc > valueStack.length && func.argc != Infinity) {
                throw "error: not enough arguments given";
            }

            var args = [];
            while (valueStack.length > 0 && args.length < func.argc) {
                args.unshift(valueStack.pop());
            }

            var returnValue = func.call(args, context);
            if (returnValue != undefined) {
                valueStack.push(returnValue);
            }
        } else if (currentToken.type == 'number' || currentToken.type == 'identifier' || currentToken.type == 'term' || currentToken.type == 'string') {
            valueStack.push(currentToken);
        } else if (currentToken.type == 'semicolon') {
            valueStack.length = 0;
        }
    }

    if (valueStack.length > 1) {
        throw "error: invalid expression";
    }

    if (valueStack.length == 0) {
        return undefined;
    }

    return valueStack[0].copy(context);
}

function splitInfixExpression(infixExpression) {
    var outputQueue = [];
    var token = "",
        element = undefined;
    var type = 'ws';
    var index = 0;

    var push = function() {
        if (type == 'ws') return;

        outputQueue.push(token);
        type = 'ws';
        token = '';
    }

    while (index < infixExpression.length) {
        element = infixExpression[index];

        if (type == 'string') {
            token += element;

            if (element == '\"') push();
        } else {
            if (element == ' ') {
                push();
            } else if (element == '\"') {
                push();

                type = 'string';
                token = element;
            } else if (isOperatorCharacter(element)) {
                if (type == 'operator') {
                    if (isOperatorToken(token + element)) {
                        token += element;
                    } else {
                        push();
                        type = 'operator';
                        token = element;
                    }
                } else {
                    push();
                    type = 'operator';
                    token = element;
                }
            } else if (isNumberCharacter(element)) {
                if (type == 'number') {
                    token += element;
                } else {
                    push();
                    type = 'number';
                    token = element;
                }
            } else if (isIdentifierToken(element)) {
                if (type == 'identifier') {
                    token += element;
                } else {
                    push();
                    type = 'identifier';
                    token = element;
                }
            }
        }
        index++;
    }

    if (type != 'ws') outputQueue.push(token);

    return outputQueue;
}

function createPostfixExpression(infixExpression) {
    var inputQueue = splitInfixExpression(infixExpression);
    var outputQueue = [];
    var operatorStack = [];
    var currentElement = undefined;
    var precedingElement = undefined;
    var succeedingElement = inputQueue.shift();

    while (succeedingElement != undefined) {
        precedingElement = currentElement;
        currentElement = succeedingElement;
        succeedingElement = inputQueue.shift();

        var token = tokenize(currentElement, precedingElement, succeedingElement);
        switch (token.type) {
            case 'paramblock':
                if (token.orientation == 'left') {
                    outputQueue.push(token);
                    operatorStack.push(token);
                } else if (token.orientation == 'right') {
                    var topItem = undefined;

                    var termBlock = {
                        type: 'paramblock',
                        params: [],
                    };

                    while ((topItem = outputQueue.pop()) != undefined && topItem.type != 'paramblock') {
                        termBlock.params.push(topItem);
                    }

                    outputQueue.push(termBlock);
                    operatorStack.pop(); // pop paramblock
                }
                break;
            case 'operator':
                var topItem = undefined;
                while ((topItem = operatorStack[operatorStack.length - 1]) != undefined && topItem.type == 'operator') {
                    if (token.bound == 'left' && token.precedence <= topItem.precedence) {
                        outputQueue.push(operatorStack.pop());
                    } else if (token.bound == 'right' && token.precedence < topItem.precedence) {
                        outputQueue.push(operatorStack.pop());
                    } else {
                        break;
                    }
                }
                operatorStack.push(token);
                break;
            case 'seperator':
                var topItem = undefined;
                while ((topItem = operatorStack[operatorStack.length - 1]) != undefined && topItem.type != 'parentheses' && topItem.type != 'paramblock') {
                    outputQueue.push(operatorStack.pop());
                }
                break;
            case 'lambdablock':
                operatorStack.push(token);
                outputQueue.push(token);
                break;
            case 'semicolon':
                var activeOperator = undefined;
                while ((activeOperator = operatorStack.pop()) != undefined && activeOperator.type != 'lamdablock') {
                    outputQueue.push(activeOperator);
                }
                outputQueue.push(token);
                break;
            case 'parentheses':
                if (token.orientation == 'left') {
                    operatorStack.push(token);
                } else if (token.orientation == 'right') {
                    var topItem = undefined;

                    while ((topItem = operatorStack.pop()) != undefined && !(topItem.type == 'parentheses' && topItem.orientation == 'left') && !(topItem.type == 'lambdablock')) {
                        outputQueue.push(topItem);
                    }

                    if (topItem.type == 'lambdablock') {
                        var term = [];
                        while ((topItem = outputQueue.pop()) != undefined && topItem.type != 'lambdablock') {
                            term.unshift(topItem);
                        }

                        var paramblock = outputQueue.pop();
                        operatorStack.push({
                            type: 'term',
                            params: paramblock.params,
                            term: term.slice(),
                            argc: paramblock.params.length,
                            call: function(args, context) {
                                var functionContext = new Context(undefined, context);
                                var index = 0;

                                if (args.length < this.argc) {
                                    throw 'error: not enough arguments given (inline)';
                                }

                                this.params.forEach(function(e) {
                                    functionContext.set(e.name, storeIdentifier(e.name, args[args.length-index-1]));
                                    index++;
                                });

                                return evalPostfixExpression(term.slice(), functionContext);
                            },
                        });
                    } else {
                        if (operatorStack.length > 0) {
                            topItem = operatorStack[operatorStack.length - 1];
                            if (topItem.type == 'function' || topItem.type == 'term') {
                                topItem = operatorStack.pop();
                                if (topItem.type == 'term') {
                                    topItem.type = 'inline-function';
                                }
                                outputQueue.push(topItem);
                            }
                        }
                    }
                }
                break;
            case 'function':
                operatorStack.push(token);
                break;
            case 'number':
                outputQueue.push(token);
                break;
            case 'string':
                outputQueue.push(token);
                break;
            case 'invalid':
                throw "error: invalid token ('" + token.value + "')";
                break;
            case 'identifier':
                outputQueue.push(token);
                break;
        }
    }

    while ((currentItem = operatorStack.pop()) != undefined) {
        outputQueue.push(currentItem);
    }

    return outputQueue;
}

function Context(local, wrapper) {
    this.wrapper = wrapper || undefined;
    this.local = local || {};
    this.import = {};
    this.get = function(identifier) {
        if (!this.local.hasOwnProperty(identifier)) {
            if (wrapper != undefined) {
                return wrapper.get(identifier);
            } else {
                return undefined;
            }
        } else {
            return this.local[identifier];
        }
    };
    this.getImport = function(namespace, identifier) {
        if (this.import.hasOwnProperty(namespace)) {
            var module = this.import[namespace];
            if (module.hasOwnProperty(identifier)) {
                return module[identifier];
            } else {
                return undefined;
            }
        } else {
            if (this.wrapper != undefined) {
                return wrapper.getImport(namespace, identifier);
            } else {
                return undefined;
            }
        }
    };
    this.set = function(identifier, object, context) {
        if (context == undefined) {
            if (this.local.hasOwnProperty(identifier)) {
                if (this.local[identifier].protected) {
                    throw 'error: protected identifier';
                } else {
                    this.local[identifier] = object;
                }
            } else {
                this.local[identifier] = object;
            }
        } else {
            context[identifier] = object;
        }
    };
    this.global = function() {
        if (this.wrapper != undefined) {
            return this.wrapper.global();
        } else {
            return this;
        }
    };
    this.call = function(name, args, context) {
        var ident = this.get(name);
        if (ident == undefined || ident.type != 'function') {
            throw "error: function not defined";
        } else {
            return ident.solve(args, context);
        }
    };
    this.print = function(string) {
        if (this.terminal != undefined) {
            this.terminal.echo(string);
        } else if (wrapper != undefined) {
            wrapper.print(string);
        }
    };
}


var globalContext = {
    'call': {
        type: 'function',
        argc: Infinity,
        call: function(args, context) {
            if (args.length == 0) {
                throw 'error: empty call';
            }
            var type = args[0].type;
            if (type == 'identifier') {
                var name = args[0].name;
            } else if (type == 'string') {
                var name = args[0].value(context);
            }

            var fnc = context.get(name);
            if (fnc == undefined) {
                throw 'error: function not defined';
            }
            args.shift();
            if (fnc.argc != args.length && fnc.argc != Infinity) {
                throw 'error: not enough arguments given';
            }
            return fnc.call(args, context);
        },
        protected: true,
    },
    'assign': {
        type: 'function',
        argc: 2,
        call: function(args, context) {
            if (args[1].type == 'identifier' || args[1].type == 'number' || args[1].type == 'string') {
                var name = args[0].name;
                var value = args[1].value(context);
                var type = args[1].type;
                var object = undefined;

                if (type == 'identifier') {
                    object = args[1].copy(context);
                } else if (type == 'string') {
                    object = storeIdentifier(name, storeString(value));
                } else if (type == 'number') {
                    object = storeIdentifier(name, storeNumber(value));
                }

                object.name = name;
                context.set(name, object);

                return object;
            } else if (args[1].type == 'term') {
                var name = args[0].name,
                    func = jQuery.extend({}, args[1]);

                console.log(func);
                func.type = 'function';
                func.valueType = function(context) { return 'function'; };
                context.set(name, func);
            }
        },
        protected: true,
    },
    'power': {
        type: 'function',
        argc: 2,
        call: function(args, context) {
            return storeNumber(Math.pow(args[0].value(context), args[1].value(context)));
        },
        protected: true,
    },
    'add': {
        type: 'function',
        argc: 2,
        call: function(args, context) {
            var typeA = args[0].valueType(context);
            var typeB = args[1].valueType(context);

            if (typeA == 'string' || typeB == 'string') {
                return storeString(args[0].value(context) + args[1].value(context));
            } else {
                return storeNumber(args[0].value(context) + args[1].value(context));
            }
        },
        protected: true,
    },
    'subtract': {
        type: 'function',
        argc: 2,
        call: function(args, context) {
            return storeNumber(args[0].value(context) - args[1].value(context));
        },
        protected: true,
    },
    'multiply': {
        type: 'function',
        argc: 2,
        call: function(args, context) {
            var typeA = args[0].valueType(context);
            var typeB = args[1].valueType(context);

            if ((typeA == 'string' || typeB == 'string') && typeA != typeB) {
                var str, count;
                if (typeA == 'string') {
                    str = args[0].value(context);
                    count = args[1].value(context);
                } else {
                    str = args[1].value(context);
                    count = args[0].value(context);
                }
                var n = "";
                for (var i = 0; i < count; i++) {
                    n += str;
                }
                return storeString(n);
            } else {
                return storeNumber(args[0].value(context) * args[1].value(context));
            }
        },
        protected: true,
    },
    'divide': {
        type: 'function',
        argc: 2,
        call: function(args, context) {
            return storeNumber(args[0].value(context) / args[1].value(context));
        },
        protected: true,
    },
    'factorial': {
        type: 'function',
        argc: 1,
        call: function(args, context) {
            var fac;
            fac = function(a) {
                if (a == 0) return 1;
                else if (a == 1) return 1;
                else return fac(a - 1) + fac(a - 2);
            };
            return storeNumber(fac(args[0].value(context)));
        },
        protected: true,
    },
    'round': {
        type: 'function',
        argc: 1,
        call: function(args, context) {
            return storeNumber(Math.round(args[0].value(context)));
        },
        protected: true,
    },
    'abs': {
        type: 'function',
        argc: 1,
        call: function(args, context) {
            return storeNumber(Math.abs(args[0].value(context)));
        },
        protected: true,
    },
    'invert': {
        type: 'function',
        argc: 1,
        call: function(args, context) {
            return storeNumber(-args[0].value(context));
        },
        protected: true,
    },
    'uninvert': {
        type: 'function',
        argc: 1,
        call: function(args, context) {
            return storeNumber(args[0].value(context));
        },
        protected: true,
    },
    'print': {
        type: 'function',
        argc: Infinity,
        call: function(args, context) {
            var out = "";
            var token = undefined;
            while ((token = args.shift()) != undefined) out += token.value(context) + ", ";

            context.print(out.substr(0, out.length - 2));
        },
        protected: true,
    },
    'modulo': {
        type: 'function',
        argc: 2,
        call: function(args, context) {
            return storeNumber(args[0].value(context) % args[1].value(context));
        }
    }
};

var tear = tear || {
    eval: function(expression, terminal) {
        tear.context.terminal = terminal;
        var postfix = createPostfixExpression(expression);
        var result = evalPostfixExpression(postfix, tear.context);

        if (result != undefined) return '<- ' + result;
        else return "<- undefined";
    }
};
tear.context = new Context(undefined, new Context(globalContext));
