import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/validations'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyType, ...rest } = body
    const validated = registerSchema.parse(rest)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12)

    // Create company and user in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const company = await tx.company.create({
        data: {
          name: validated.companyName,
          type: companyType,
          email: validated.companyEmail,
          phone: validated.companyPhone,
          address: validated.companyAddress,
        },
      })

      const user = await tx.user.create({
        data: {
          email: validated.email,
          password: hashedPassword,
          name: validated.name,
          role: companyType === 'SUPPLIER' ? 'SUPPLIER_EMPLOYEE' : 'LOGISTICS_EMPLOYEE',
          companyId: company.id,
          isCompanyAdmin: true,
        },
      })

      return { company, user }
    })

    return NextResponse.json({
      message: 'Registration successful',
      userId: result.user.id,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
