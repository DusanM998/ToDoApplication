using EL.Models.Group;
using FluentValidation;

namespace BLL.Validators
{
    public class GroupValidator : AbstractValidator<Group>
    {
        public GroupValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Group name is required.")
                .MaximumLength(100).WithMessage("Group name must not exceed 100 characters.");

            RuleFor(x => x.CreatedById)
                .NotEmpty().WithMessage("CreatedById is required.");

            RuleForEach(x => x.Members)
                .SetValidator(new GroupMemberValidator());

            RuleForEach(x => x.Messages)
                .SetValidator(new GroupMessageValidator());
        }
    }
}
