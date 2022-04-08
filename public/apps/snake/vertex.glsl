attribute vec4 aVertexPosition;

uniform mat4 model;
uniform mat4 projection;

void main() 
{
    gl_Position = projection * model * aVertexPosition;
}